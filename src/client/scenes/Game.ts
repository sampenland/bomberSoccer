import Phaser from 'phaser'
import Player from '~/gameObjects/player';
import Colors from '~/globals/Colors'

export default class Game extends Phaser.Scene {

    public static player:Player;

    constructor() {

        super('game');
        console.log("Game booted.");

    }

    preload() {

        this.cameras.main.backgroundColor = Colors.gameBackground;

        // cursor
        this.input.setDefaultCursor('url(assets/sprites/pointer.png), pointer');

        // sprites
        this.load.setBaseURL('assets');
        this.load.spritesheet('player', 'sprites/player.png', {frameWidth: 12, frameHeight: 12});

    }

    create() {

        this.createLevel();

    }

    update() {

    }

    createLevel() {

        // create player
        Game.player = new Player({
            scene:this,
            x:this.cameras.main.centerX, 
            y:this.cameras.main.height - 12 - 4
        });

    }

}