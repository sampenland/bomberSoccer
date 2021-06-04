import Phaser from 'phaser'
import GameBall from '../gameObjects/GameBall';
import Player from '../gameObjects/Player';
import RealBomb from '../gameObjects/RealBomb';
import Colors from '../globals/Colors'
import GameManager from '../globals/GameManager';
import { IBombDrop, IGameBall, IGameRoomState, IPlayer } from '../interfaces/IClientServer';

export default class Game extends Phaser.Scene {

    paused:boolean = true;
    public static player:Player;
    public static opponent:Player;
    public static gameBall:GameBall;

    bombs:Map<number, RealBomb>;

    spaceDown:boolean = false;

    constructor() {

        super('game');
        this.bombs = new Map<number, RealBomb>();

    }

    preload() {

        this.cameras.main.backgroundColor = Colors.gameBackground;

        // sprites
        this.load.setBaseURL('assets');
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

        let space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        let spacePressed = space.isDown && !this.spaceDown;

        GameManager.onlineRoom.send("controls", {up:up.isDown, down:down.isDown, left:left.isDown, right:right.isDown, space:spacePressed});
        this.spaceDown = space.isDown;
    }

    create() {

        GameManager.onlineRoom.onMessage("startGame", this.startGame.bind(this, this));
        GameManager.onlineRoom.onStateChange(this.sync.bind(this, this));
        GameManager.onlineRoom.onMessage("bombDrop", this.createBomb.bind(this, this));
        GameManager.onlineRoom.onMessage("explodeBomb", this.explodeBomb.bind(this, this));

        console.log("Game booted.");
        this.createLevel();

    }

    startGame(scene:this, data:{playerOne:IPlayer, playerTwo:IPlayer, gameBall:IGameBall}) {

        console.log("Both players here. Starting game.");
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

        this.time.delayedCall(1000, () => {
            
            GameManager.onlineRoom.send("requestStart", {

                gameSize:{width:GameManager.width, height:GameManager.height},
                borderSize:GameManager.borderSize,
                goalSize:GameManager.goalSize,

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

            console.log(player.id, GameManager.opponentId);
            if(player.id == GameManager.opponentId){
                scene.otherPlayerUpdate(player);
            }

        });

    }

    updateGameBall(gameBall:IGameBall) {

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

        this.requestStart();

    }

}