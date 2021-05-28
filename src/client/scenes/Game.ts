import Phaser from 'phaser'
import Player from '../gameObjects/Player';
import Colors from '../globals/Colors'
import GameManager from '../globals/GameManager';

export default class Game extends Phaser.Scene {

    public static player:Player;

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

    update() {



    }

    createLevel() {

        console.log("Creating Level");

    }

}