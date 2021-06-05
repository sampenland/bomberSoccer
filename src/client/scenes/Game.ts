import Phaser from 'phaser'
import GameBall from '../gameObjects/GameBall';
import Player from '../gameObjects/Player';
import RealBomb from '../gameObjects/RealBomb';
import Colors from '../globals/Colors'
import GameManager from '../globals/GameManager';
import { IBombDrop, IGameBall, IGameRoomState, IPhysicsSettings, IPlayer } from '../interfaces/IClientServer';

export default class Game extends Phaser.Scene {

    paused:boolean = true;
    settings:Phaser.GameObjects.DOMElement | undefined;
    showingSettings:boolean = false;
    public static player:Player;
    public static opponent:Player;
    public static gameBall:GameBall;

    bombs:Map<number, RealBomb>;

    spaceDown:boolean = false;
    tDown:boolean = false;

    constructor() {

        super('game');
        this.bombs = new Map<number, RealBomb>();

    }

    preload() {

        this.cameras.main.backgroundColor = Colors.gameBackground;

        // sprites
        this.load.setBaseURL('assets');
        this.load.html('settings', 'html/settings.html');
        this.load.spritesheet('player', 'sprites/player.png', {frameWidth: 14, frameHeight: 14});
        this.load.spritesheet('gameBall', 'sprites/gameBall.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('bomb', 'sprites/bomb.png', {frameWidth: 8, frameHeight: 9});
        this.load.spritesheet('bombExplode', 'sprites/bombExplode.png', {frameWidth: 24, frameHeight: 24});

    }

    update(){

        if(this.paused) return;

        this.controls();

    }

    controls(){

        let left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        let right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        let up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        let down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        
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

        let space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        let spacePressed = space.isDown && !this.spaceDown;

        GameManager.onlineRoom.send("controls", {up:up.isDown, down:down.isDown, left:left.isDown, right:right.isDown, space:spacePressed});
        this.spaceDown = space.isDown;
        this.tDown = t.isDown;
        
    }

    create() {

        GameManager.onlineRoom.onMessage("startGame", this.startGame.bind(this, this));
        GameManager.onlineRoom.onStateChange(this.sync.bind(this, this));
        GameManager.onlineRoom.onMessage("bombDrop", this.createBomb.bind(this, this));
        GameManager.onlineRoom.onMessage("explodeBomb", this.explodeBomb.bind(this, this));
        GameManager.onlineRoom.onMessage("adjustedSettings", this.adjustedSettings.bind(this, this));

        console.log("Game booted.");
        this.createLevel();

    }

    startGame(scene:this, data:{playerOne:IPlayer, playerTwo:IPlayer, gameBall:IGameBall}) {

        console.log("Starting game.");
        scene.paused = false;

        scene.updateGameBall(data.gameBall);
        
        if(data.playerOne.id == GameManager.onlineRoom.sessionId) {
            
            Game.player.id = data.playerOne.id;
            Game.opponent.id = data.playerTwo.id;

            scene.thisPlayerUpdate(data.playerOne);
            scene.otherPlayerUpdate(data.playerTwo);
            GameManager.opponentId = data.playerTwo.id;
        }
        else 
        {
            Game.opponent.id = data.playerOne.id;
            Game.player.id = data.playerTwo.id;

            scene.thisPlayerUpdate(data.playerTwo);
            scene.otherPlayerUpdate(data.playerOne);
            GameManager.opponentId = data.playerOne.id;
        }
    }

    requestStart() {

        if(this.paused == false) return;
        
        this.time.delayedCall(1000, () => {
            
            GameManager.onlineRoom.send("requestStart", {

                gameSize:{width:GameManager.width, height:GameManager.height},
                borderSize:GameManager.borderSize,
                goalSize:GameManager.goalSize,
                testGame: GameManager.playerName == GameManager.testName,

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
        Game.gameBall.setPosition(gameBall.x, gameBall.y);

    }

    thisPlayerUpdate(player:IPlayer) {

        //Game.player.angle = player.angle;
        Game.player.setPosition(player.x, player.y);

    }

    otherPlayerUpdate(player:IPlayer) {

        //Game.opponent.angle = player.angle;
        Game.opponent.setPosition(player.x, player.y);

    }

    createBomb(scene:this, data:IBombDrop){

        let newBomb = new RealBomb(this, data.player.x, data.player.y, data.bombId, data.player.id);
        this.bombs.set(data.bombId, newBomb);

    }

    explodeBomb(scene:this, data:{bombId:number})
    {
        let theBomb = this.bombs.get(data.bombId);
        if(theBomb == undefined) return;
        theBomb.explode();
    }

    createLevel() {

        console.log("Creating Level");

        let centerXline = this.add.rectangle(0, GameManager.height/2 - 1, GameManager.width, 1, Colors.gray.color32).setOrigin(0, 0);
        let centerYline = this.add.rectangle(GameManager.width/2 - 1, 0, 1, GameManager.height, Colors.gray.color32).setOrigin(0, 0);

        let top = this.add.rectangle(0, 0, GameManager.width, GameManager.borderSize, Colors.darkGray.color32).setOrigin(0, 0);
        let bottom = this.add.rectangle(0, GameManager.height - GameManager.borderSize, GameManager.width, GameManager.borderSize, Colors.darkGray.color32).setOrigin(0, 0);
        let left = this.add.rectangle(0, 0, GameManager.borderSize, GameManager.height, Colors.darkGray.color32).setOrigin(0, 0);
        let right = this.add.rectangle(GameManager.width - GameManager.borderSize, 0, GameManager.borderSize, GameManager.height, Colors.darkGray.color32).setOrigin(0, 0);

        let topGoal = this.add.rectangle(GameManager.width/2 - GameManager.goalSize/2, 0, GameManager.goalSize, GameManager.borderSize, Colors.white.color32).setOrigin(0, 0);
        let bottomGoal = this.add.rectangle(GameManager.width/2 - GameManager.goalSize/2, GameManager.height - GameManager.borderSize, GameManager.goalSize, GameManager.borderSize, Colors.white.color32).setOrigin(0, 0);

        Game.player = new Player(this);
        Game.opponent = new Player(this);

        Game.player.tint = Colors.white.color32;
        Game.opponent.tint = Colors.lightGreen.color32;

        Game.gameBall = new GameBall(this);

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
                var maxSpeed = (this.settings.getChildByName('maxSpeed') as HTMLInputElement).value;
                var gameBallMass = (this.settings.getChildByName('gameBallMass') as HTMLInputElement).value;

                GameManager.onlineRoom.send("adjustedSettings", {
                    blastRadiusMax:blastRadius,
                    blastMagnitude:blastMagnitude,
                    explodeTime:explodeTime,
                    maxSpeed,
                    gameBallMass:gameBallMass,
                });
            }

            if(event.target.name === "resetBallButton")
            {
                GameManager.onlineRoom.send("resetBall");
            }

        });

    }

    adjustedSettings(scene:this, data:IPhysicsSettings) {

        if(scene.settings == undefined) return;

        (scene.settings.getChildByName('blastRadius') as HTMLInputElement).value = data.blastRadiusMax.toString();
        (scene.settings.getChildByName('blastMagnitude') as HTMLInputElement).value = data.blastMagnitude.toString();
        (scene.settings.getChildByName('explodeTime') as HTMLInputElement).value = data.explodeTime.toString();
        (scene.settings.getChildByName('maxSpeed') as HTMLInputElement).value = data.maxSpeed.toString();
        (scene.settings.getChildByName('gameBallMass') as HTMLInputElement).value = data.gameBallMass.toString();

        this.hideSettings();

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