import Phaser from 'phaser'
import Player from '../gameObjects/Player';
import RealBomb from '../gameObjects/RealBomb';
import Colors from '../globals/Colors'
import GameManager from '../globals/GameManager';
import { IBombDrop, IGameRoomState, IPlayer } from '../interfaces/IClientServer';

export default class Game extends Phaser.Scene {

    paused:boolean = true;
    public static player:Player;
    public static opponent:Player;

    constructor() {

        super('game');

    }

    preload() {

        this.cameras.main.backgroundColor = Colors.gameBackground;

        // sprites
        this.load.setBaseURL('assets');
        this.load.spritesheet('player', 'sprites/player.png', {frameWidth: 14, frameHeight: 14});
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

        GameManager.onlineRoom.send("controls", {up:up.isDown, down:down.isDown, left:left.isDown, right:right.isDown, space:space.isDown});
    }

    create() {

        GameManager.onlineRoom.onMessage("startGame", this.startGame.bind(this, this));
        GameManager.onlineRoom.onStateChange(this.sync.bind(this, this));
        GameManager.onlineRoom.onMessage("bombDrop", this.createBomb.bind(this, this));

        console.log("Game booted.");
        this.createLevel();

    }

    startGame(scene:this, data:{playerOne:IPlayer, playerTwo:IPlayer}) {

        console.log("Both players here. Starting game.");
        scene.paused = false;
        
        if(data.playerOne.id == GameManager.onlineRoom.sessionId) {
            scene.thisPlayerUpdate(data.playerOne);
            scene.otherPlayerUpdate(data.playerTwo);
            GameManager.opponentId = data.playerTwo.id;
        }
        else 
        {
            scene.thisPlayerUpdate(data.playerTwo);
            scene.otherPlayerUpdate(data.playerOne);
            GameManager.opponentId = data.playerOne.id;
        }
    }

    requestStart() {

        this.time.delayedCall(1000, () => {
            
            GameManager.onlineRoom.send("requestStart", {});
            
            if(this.paused == true)
            {
                this.requestStart();
            }


        }, [], this);

    }

    sync(scene:this, state:IGameRoomState){

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

    thisPlayerUpdate(player:IPlayer) {

        //Game.player.angle = player.angle;
        Game.player.setPosition(player.x, player.y);

    }

    otherPlayerUpdate(player:IPlayer) {

        //Game.opponent.angle = player.angle;
        Game.opponent.setPosition(player.x, player.y);

    }

    createBomb(scene:this, data:IBombDrop){

        let newBomb = new RealBomb(this, data.x, data.y, data.explodeTime);

    }

    createLevel() {

        console.log("Creating Level");

        Game.player = new Player(this);
        Game.opponent = new Player(this);

        this.requestStart();

    }

}