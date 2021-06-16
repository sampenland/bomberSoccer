import Phaser from 'phaser'
import GameBall from '../gameObjects/GameBall';
import Player from '../gameObjects/Player';
import PurchaseHub from '../gameObjects/PurchaseHub';
import RealBomb from '../gameObjects/RealBomb';
import Colors from '../globals/Colors'
import GameManager from '../globals/GameManager';
import { IAdjustableSettings, IBombDrop, IGameBall, IGameRoomState, IPlayer } from '../interfaces/IClientServer';

export default class Game extends Phaser.Scene {

    paused:boolean = true;
    settings:Phaser.GameObjects.DOMElement | undefined;
    showingSettings:boolean = false;
    public static player:Player;
    public static opponent:Player;
    public static gameBall:GameBall;

    purchaseHub:PurchaseHub | undefined;

    mouseLabel:Phaser.GameObjects.DOMElement | undefined;

    bombs:Map<number, RealBomb>;

    leftClickDown:boolean = false;
    rightClickDown:boolean = false;
    middleClickDown:boolean = false;

    playerOneScore:Phaser.GameObjects.DOMElement | undefined;
    playerTwoScore:Phaser.GameObjects.DOMElement | undefined;

    tDown:boolean = false;

    leftGoal:Phaser.GameObjects.Rectangle | undefined;
    rightGoal:Phaser.GameObjects.Rectangle | undefined;

    constructor() {

        super('game');
        this.bombs = new Map<number, RealBomb>();

    }

    preload() {

        this.cameras.main.backgroundColor = Colors.gameBackground;

        // sprites
        this.load.html('settings', 'html/settings.html');
        this.load.html('playerLabel', 'html/playerLabel.html');
        this.load.html('text', 'html/text.html');
        this.load.html('loadout', 'html/purchaseHub/loadout.html');
        this.load.html('opponentLoadout', 'html/purchaseHub/opponentLoadout.html');
        this.load.html('coinText', 'html/purchaseHub/coins.html');
        this.load.html('readyBtn', 'html/purchaseHub/readyBtn.html');
        this.load.html('readyLabel', 'html/purchaseHub/readyLabel.html');
        this.load.html('textSmall', 'html/textSmall.html');
        this.load.html('textLarge', 'html/textLarge.html');
        this.load.html('null', 'sprites/null.png');
        this.load.spritesheet('player', 'sprites/player.png', {frameWidth: 20, frameHeight: 20});
        this.load.spritesheet('playerTeleport', 'sprites/playerTeleport.png', {frameWidth: 14, frameHeight: 22});
        this.load.spritesheet('moveTimer', 'sprites/moveTimer.png', {frameWidth: 8, frameHeight: 9});
        this.load.spritesheet('gameBall', 'sprites/gameBall.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('bomb', 'sprites/bomb.png', {frameWidth: 8, frameHeight: 9});
        this.load.spritesheet('bombExplode', 'sprites/bombExplode.png', {frameWidth: 24, frameHeight: 24});

    }

    update(){

        if(this.purchaseHub != undefined) {
         
            this.purchaseHub.update();

            if(PurchaseHub.turns % PurchaseHub.purchaseTurnEvery == 0) {
                
                this.purchaseHub.update();
                
                if(!this.purchaseHub.purchaseHubVisible) {
                    this.purchaseHub.updated = false;
                    this.purchaseHub.updateDisplay(true);
                }
                
                return;
            }
            else {
                if(this.purchaseHub.purchaseHubVisible) {
                    this.purchaseHub.updated = false;
                    this.purchaseHub.updateDisplay(false);
                }
            }

        }

        if(this.paused) return;

        Game.gameBall.update();
        
        this.controls();
        Game.player.update();
        Game.opponent.update();

    }

    controls(){

        this.controlSettings();
        let c = this.controlMouse();

        if(c.rightPressed || c.leftPressed || c.middlePressed) {
           
            let correctedJumpPos = {x:c.mouseX, y:c.mouseY};

            if(GameManager.solidPlayers) {
                correctedJumpPos = Game.gameBall.findBestPosition(c.mouseX, c.mouseY);
            }
            
            if(Game.player.moves > 0)
                {
                    
                    GameManager.onlineRoom.send("controls", {
                        mouseX: correctedJumpPos.x,
                        mouseY: correctedJumpPos.y,
                        leftPressed: c.leftPressed,
                        rightPressed: c.rightPressed,
                        middlePressed: c.middlePressed,
                    });
    
                    Game.player.teleport();
                }

        }

    }

    showOpponentTeleport(scene:this, data:{x:number, y:number}) {
        Game.opponent.setPosition(data.x, data.y);
        Game.opponent.teleport();
    }

    score(scene:this, data:any) {

        this.bombs.forEach( (bomb) => {
            bomb.remove();
        });

        if(scene.purchaseHub) {
            scene.purchaseHub.updated = false;
        }
        
        PurchaseHub.turns++;
        GameManager.onlineRoom.send("reset",{});

    }

    controlMouse() {

        let leftClick = this.input.activePointer.leftButtonDown();
        let rightClick = this.input.activePointer.rightButtonDown();
        let middleClick = this.input.activePointer.middleButtonDown();

        let leftClickPressed = leftClick && !this.leftClickDown;
        let rightClickPressed = rightClick && !this.rightClickDown;
        let middleClickPressed = middleClick && !this.middleClickDown;

        this.leftClickDown = leftClick;
        this.rightClickDown = rightClick;
        this.middleClickDown = middleClick;

        return {
            mouseX: this.input.mousePointer.worldX, 
            mouseY: this.input.mousePointer.worldY, 
            leftPressed: leftClickPressed, 
            rightPressed: rightClickPressed,
            middlePressed: middleClickPressed,
        };

    }

    controlSettings() {

        let t = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
        let tPressed = t.isDown && !this.tDown;

        if(tPressed) {

            if(!this.showingSettings) {
                this.showingSettings = true;
                this.showSettings();
            }
            else
            {
                this.showingSettings = false;
                this.hideSettings();
            }
        }

        this.tDown = t.isDown;

    }

    create() {

        this.purchaseHub = new PurchaseHub(this, 25, GameManager.width, GameManager.height);
        
        this.setupServerMessages();

        console.log("Game booted.");
        this.createLevel();

    }

    setupServerMessages() {

        GameManager.onlineRoom.onMessage("startGame", this.startGame.bind(this, this));
        GameManager.onlineRoom.onStateChange(this.sync.bind(this, this));
        GameManager.onlineRoom.onMessage("bombDrop", this.createBomb.bind(this, this));
        GameManager.onlineRoom.onMessage("explodeBomb", this.explodeBomb.bind(this, this));
        GameManager.onlineRoom.onMessage("adjustedSettings", this.adjustedSettings.bind(this, this));
        GameManager.onlineRoom.onMessage("opponentPosition", this.showOpponentTeleport.bind(this, this));
        GameManager.onlineRoom.onMessage("score", this.score.bind(this, this));
        GameManager.onlineRoom.onMessage("startCountdown", this.startCountdown.bind(this, this));
    }

    startCountdown(scene:this, data:{delay:boolean}) {

        this.paused = true;

        console.log("Purchase Hub finished. Starting...");
        PurchaseHub.turns++;

        let counter = this.add.dom(GameManager.width/2 - 45, 15).createFromCache('textLarge');

        this.tweens.addCounter({
            from:3,
            to:0,
            duration:3000,
            onUpdate: (t) => {
                let cnt = (Math.round(t.getValue())).toString();
                if(cnt.length == 1) cnt = "0" + cnt;
                (counter.getChildByID("text") as HTMLSpanElement).innerHTML = cnt;
            },
            onComplete: () => {
                this.paused = false;
                counter.destroy();
                
                Game.player.label.visible = true;
                Game.opponent.label.visible = true;
            },
        });
        
    }

    startGame(scene:this, data:{playerOne:IPlayer, playerTwo:IPlayer, gameBall:IGameBall, maxBombs:number}) {

        console.log("Starting game.");
        scene.paused = false;
        GameManager.maxBombs = data.maxBombs;

        if(scene.leftGoal && scene.rightGoal) {
        
            if(data.playerOne.playerNumber == 0) 
            {
                scene.leftGoal.fillColor = 0x00ff00;
                scene.rightGoal.fillColor = 0xff0000;
            }
            else 
            {
                scene.leftGoal.fillColor = 0xff0000;
                scene.rightGoal.fillColor = 0x00ff00;
            }

        }
        
        scene.updateGameBall(data.gameBall);
        
        if(data.playerOne.id == GameManager.onlineRoom.sessionId) {
            
            Game.player.id = data.playerOne.id;
            Game.player.playerNum = data.playerOne.playerNumber;
            Game.opponent.playerNum = data.playerTwo.playerNumber;
            Game.opponent.id = data.playerTwo.id;

            scene.thisPlayerUpdate(data.playerOne);
            scene.otherPlayerUpdate(data.playerTwo);
            GameManager.opponentId = data.playerTwo.id;
        }
        else 
        {
            Game.opponent.id = data.playerOne.id;
            Game.opponent.playerNum = data.playerOne.playerNumber;
            Game.player.playerNum = data.playerTwo.playerNumber;
            Game.player.id = data.playerTwo.id;

            scene.thisPlayerUpdate(data.playerTwo);
            scene.otherPlayerUpdate(data.playerOne);
            GameManager.opponentId = data.playerOne.id;
        }

        this.purchaseHub?.updateDisplay(true);
    }

    requestStart() {

        if(this.paused == false) return;
        
        this.time.delayedCall(1000, () => {
            
            GameManager.onlineRoom.send("requestStart", {

                gameSize:{width:GameManager.width, height:GameManager.height},
                borderSize:GameManager.borderSize,
                goalSize:GameManager.goalSize,
                testGame: GameManager.playerName == GameManager.testName,
                bombsAvailable: -1,

            });
            
            if(this.paused == true)
            {
                this.requestStart();
            }


        }, [], this);

    }

    sync(scene:this, state:IGameRoomState){

        scene.updateGameBall(state.gameWorld.gameBall);
    
        state.players.forEach((player) => {

            if(player.playerNumber == 1)
            {
                if(this.playerOneScore)
                this.playerOneScore.getChildByID("text").innerHTML = (player.name + ": " + player.score);
            }
            else
            {
                if(this.playerTwoScore)
                this.playerTwoScore.getChildByID("text").innerHTML = (player.name + ": " + player.score);
            }

            if(player.id == GameManager.onlineRoom.sessionId) {
                scene.thisPlayerUpdate(player);
            }

            if(player.id == GameManager.opponentId){
                scene.otherPlayerUpdate(player);
            }

        });

    }

    updateGameBall(gameBall:IGameBall) {

        if(gameBall == undefined) return;

        if(GameManager.netcode) {
            Game.gameBall.updateNetPosition(gameBall.x, gameBall.y, gameBall.velocityX, gameBall.velocityY);
        }
        else {
            Game.gameBall.setPosition(gameBall.x, gameBall.y);
        }

        Game.gameBall.radius = gameBall.radius + 4;
        Game.gameBall.velocityX = gameBall.velocityX;
        Game.gameBall.velocityY = gameBall.velocityY;

    }

    thisPlayerUpdate(player:IPlayer) {

        //Game.player.angle = player.angle;
        Game.player.colliderRadius = player.radius;
        Game.player.bombs = player.bombsAvailable;
        Game.player.setPosition(player.x, player.y); 
        Game.player.updateDebugCollider();

    }

    otherPlayerUpdate(player:IPlayer) {

        //Game.opponent.angle = player.angle;
        Game.opponent.colliderRadius = player.radius;
        Game.opponent.bombs = player.bombsAvailable;
        Game.opponent.setPosition(player.x, player.y);
        Game.opponent.updateDebugCollider();

    }

    createBomb(scene:this, data:IBombDrop){

        //drop bomb
        let newBomb = new RealBomb(this, data.player.x, data.player.y, data.bombId, data.player.id, data.explodeDelay);
        
        if(data.isSpecial) {
            newBomb.bombType = data.special;
        }

        this.bombs.set(data.bombId, newBomb);

    }

    explodeBomb(scene:this, data:{bombId:number, explodeScale:number})
    {
        let theBomb = this.bombs.get(data.bombId);
        if(theBomb == undefined) return;
        theBomb.explode(data.explodeScale);
    }

    createLevel() {

        console.log("Creating Level");

        let centerXline = this.add.rectangle(0, GameManager.height/2 - 1, GameManager.width, 1, Colors.gray.color32).setOrigin(0, 0);
        let centerYline = this.add.rectangle(GameManager.width/2 - 1, 0, 1, GameManager.height, Colors.gray.color32).setOrigin(0, 0);

        let top = this.add.rectangle(0, 0, GameManager.width, GameManager.borderSize, Colors.darkGray.color32).setOrigin(0, 0);
        let topBody = this.matter.add.rectangle(top.x + top.width/2, top.y + top.height/2, top.width, top.height, {isStatic: true});

        let bottom = this.add.rectangle(0, GameManager.height - GameManager.borderSize, GameManager.width, GameManager.borderSize, Colors.darkGray.color32).setOrigin(0, 0);
        let bottomBody = this.matter.add.rectangle(bottom.x + bottom.width/2, bottom.y + bottom.height/2, bottom.width, bottom.height, {isStatic: true});

        let left = this.add.rectangle(0, 0, GameManager.borderSize, GameManager.height, Colors.darkGray.color32).setOrigin(0, 0);
        let leftBody = this.matter.add.rectangle(left.x + left.width/2, left.y + left.height/2, left.width, left.height, {isStatic: true});

        let right = this.add.rectangle(GameManager.width - GameManager.borderSize, 0, GameManager.borderSize, GameManager.height, Colors.darkGray.color32).setOrigin(0, 0);
        let rightBody = this.matter.add.rectangle(right.x + right.width/2, right.y + right.height/2, right.width, right.height, {isStatic: true});

        this.leftGoal = this.add.rectangle(0, GameManager.height/2 - GameManager.goalSize/2, GameManager.borderSize, GameManager.goalSize, Colors.white.color32).setOrigin(0, 0);
        this.rightGoal = this.add.rectangle(GameManager.width - GameManager.borderSize, GameManager.height/2 - GameManager.goalSize/2, GameManager.borderSize, GameManager.goalSize, Colors.white.color32).setOrigin(0, 0);

        Game.player = new Player(this);
        Game.player.setPlayerName(GameManager.playerName);
        Game.opponent = new Player(this);
        
        if(GameManager.opponentName)
            Game.opponent.setPlayerName(GameManager.opponentName);

        Game.player.tint = 0x00ff00;        
        Game.opponent.tint = 0xff0000;

        Game.gameBall = new GameBall(this);

        this.playerOneScore = this.add.dom(15, 0).createFromCache('text').setOrigin(0, 0);
        this.playerTwoScore = this.add.dom(GameManager.width - 80, 0).createFromCache('text').setOrigin(1, 0);
        
        this.mouseLabel = this.add.dom(0, 0).createFromCache('textSmall');
        this.input.setPollAlways();
        this.input.on("pointermove", (pointer) => {

            if(this.mouseLabel != undefined && GameManager.debug) {
                
                const cX = pointer.x;
                const cY = pointer.y;
    
                const mX = Math.round(cX * 100) /100;
                const mY = Math.round(cY * 100) /100;
                (this.mouseLabel.getChildByID("text") as HTMLSpanElement).innerHTML = "M: " + mX + "," + mY;
                this.mouseLabel.setPosition(cX - 12, cY - 10);

            }

        }, this);

        this.createSettings();

        this.requestStart();

    }

    createSettings() {
        
        this.settings = this.add.dom(10, 10).createFromCache('settings');
        this.settings.addListener('click');
        
        this.settings.on('click', (event) => {

            if (event.target.name === 'saveButton')
            {
                if(this.settings == undefined) return;

                var blastRadius = (this.settings.getChildByName('blastRadius') as HTMLInputElement).value;
                var blastMagnitude = (this.settings.getChildByName('blastMagnitude') as HTMLInputElement).value;
                var explodeTime = (this.settings.getChildByName('explodeTime') as HTMLInputElement).value;
                var gameBallMass = (this.settings.getChildByName('gameBallMass') as HTMLInputElement).value;
                var moveDelay = (this.settings.getChildByName('moveDelay') as HTMLInputElement).value;
                var solidPlayers = (this.settings.getChildByName('solidPlayers') as HTMLInputElement).value;
                var goalSize = (this.settings.getChildByName('goalSize') as HTMLInputElement).value;
                var airFriction = (this.settings.getChildByName('airFriction') as HTMLInputElement).value;
                var bombsAvailable = parseInt((this.settings.getChildByName('bombsAvailable') as HTMLInputElement).value);
                var bounce = (this.settings.getChildByName('bounce') as HTMLInputElement).value;
                var ballSize = (this.settings.getChildByName('ballSize') as HTMLInputElement).value;
                var netcode = (this.settings.getChildByName('netcode') as HTMLInputElement).value;

                GameManager.onlineRoom.send("adjustedSettings", {
                    blastRadiusMax:blastRadius,
                    blastMagnitude:blastMagnitude,
                    explodeTime:explodeTime,
                    gameBallMass:gameBallMass,
                    moveDelay:moveDelay,
                    solidPlayers:solidPlayers,
                    goalSize:goalSize,
                    airFriction:airFriction,
                    bombsAvailable:bombsAvailable,
                    bounce:bounce,
                    ballSize:ballSize,
                    netcode:netcode,
                });
            }

            if(event.target.name === "resetButton")
            {
                GameManager.onlineRoom.send("reset");
            }

        });

    }

    adjustedSettings(scene:this, data:IAdjustableSettings) {

        if(scene.settings == undefined) return;

        (scene.settings.getChildByName('blastRadius') as HTMLInputElement).value = data.blastRadiusMax.toString();
        (scene.settings.getChildByName('blastMagnitude') as HTMLInputElement).value = data.blastMagnitude.toString();
        (scene.settings.getChildByName('explodeTime') as HTMLInputElement).value = data.explodeTime.toString();
        (scene.settings.getChildByName('gameBallMass') as HTMLInputElement).value = data.gameBallMass.toString();
        (scene.settings.getChildByName('moveDelay') as HTMLInputElement).value = data.moveDelay.toString();
        (scene.settings.getChildByName('solidPlayers') as HTMLInputElement).value = data.solidPlayers.toString();
        (scene.settings.getChildByName('airFriction') as HTMLInputElement).value = data.airFriction.toString();
        (scene.settings.getChildByName('bombsAvailable') as HTMLInputElement).value = data.bombsAvailable.toString();
        (scene.settings.getChildByName('bounce') as HTMLInputElement).value = data.bounce.toString();
        (scene.settings.getChildByName('ballSize') as HTMLInputElement).value = data.ballSize.toString();
        (scene.settings.getChildByName('netcode') as HTMLInputElement).value = data.netcode.toString();

        GameManager.airFriction = data.airFriction;
        GameManager.blastDistance = data.blastRadiusMax;
        GameManager.solidPlayers = data.solidPlayers.toString() == "1";
        GameManager.netcode = data.netcode.toString() == "1";

        Game.gameBall.phyBody.setCircle(data.ballSize, {
            restitution: data.bounce,
            frictionAir: data.airFriction,
            isSensor: !GameManager.netcode,
        });

        (scene.settings.getChildByName('goalSize') as HTMLInputElement).value = data.goalSize.toString();
        this.updateGoals(data.goalSize);

        Game.player.moveDelay = data.moveDelay;
        Game.player.updateFramerate();
        Game.opponent.moveDelay = data.moveDelay;
        Game.opponent.updateFramerate();

        this.hideSettings();

    }

    updateGoals(goalSize:number) {

        if(this.rightGoal != undefined && this.leftGoal != undefined){
            this.leftGoal.height = goalSize;
            this.rightGoal.height = goalSize;
            this.leftGoal.y = GameManager.height/2 - goalSize/2;
            this.rightGoal.y = GameManager.height/2 - goalSize/2;
        } 

    }

    showSettings() {

        if(this.settings == undefined) return;

        this.settings.x = -100;
        this.tweens.add({
            targets: this.settings,
            duration: 500,
            x: 10
        });

        let display = this.settings.getChildByID("full") as HTMLDivElement;
        display.setAttribute("style", "display:inline;");

    }

    hideSettings() {

        if(this.settings == undefined) return;

        this.tweens.add({
            targets: this.settings,
            duration: 500,
            x: -100,
            onComplete: this.hideSettingsFinish.bind(this)
        });

    }

    hideSettingsFinish(scene:this) {
        if(scene.settings == undefined) return;
        let display = scene.settings.getChildByID("full") as HTMLDivElement;
        display.setAttribute("style", "display:none;");
    }

}