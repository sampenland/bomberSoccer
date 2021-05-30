import Phaser from 'phaser'
import Player from '../gameObjects/Player';
import Colors from '../globals/Colors'
import GameManager from '../globals/GameManager';
import { IGameRoomState, IPlayer } from '../interfaces/IClientServer';

export default class Game extends Phaser.Scene {

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

    create() {

        this.scene.pause();

        GameManager.onlineRoom.onMessage("startGame", () => {
            console.log("Both players here.");
            this.scene.resume();
        });

        console.log("Game booted.");
        this.createLevel();

    }

    sync(state:IGameRoomState){

        console.log('State update');
        state.players.forEach((player) => {

            if(player.id == GameManager.onlineRoom.sessionId) {
                this.thisPlayerUpdate(player);
            }

            if(player.id == GameManager.opponentId){
                this.otherPlayerUpdate(player);
            }

        });

    }

    thisPlayerUpdate(player:IPlayer) {

        Game.player.x = player.x;
        Game.player.y = player.y;
        Game.player.angle = player.angle;

    }

    otherPlayerUpdate(player:IPlayer) {

        Game.opponent.x = player.x;
        Game.opponent.y = player.y;
        Game.opponent.angle = player.angle;

    }

    createLevel() {

        console.log("Creating Level");

        Game.player = new Player({x:-100, y:-100, scene:this});
        Game.opponent = new Player({x:-100, y:-100, scene:this});

    }

}