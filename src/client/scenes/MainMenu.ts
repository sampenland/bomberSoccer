import Phaser from 'phaser'
import Colors from '../globals/Colors';
import * as Colyseus from 'colyseus.js'
import {Client} from 'colyseus.js'

interface xy { x: number, y:number};

export default class MainMenu extends Phaser.Scene
{

    newGame:xy = { x : 134, y : 73};
    highScores:xy = { x : 125, y : 106};

    arrow:Phaser.GameObjects.Image | undefined;

    upKey:Phaser.Input.Keyboard.Key | undefined;
    downKey:Phaser.Input.Keyboard.Key | undefined;
    enterKey:Phaser.Input.Keyboard.Key | undefined;

    menuNewGame:Phaser.GameObjects.BitmapText | undefined;
    menuHighScores:Phaser.GameObjects.BitmapText | undefined;

    client:Client;

	constructor()
	{
		super('mainMenu');
        console.log('Main Menu booted.');

        this.client = new Colyseus.Client("ws://localhost:2567");
        this.joinMainLobby();
	}

    async joinMainLobby(){

        try {

            const room = await this.client.joinOrCreate("mainLobby", {/* options */});
            console.log("Join passed.", room);
        
        } catch (e) {
            console.error("Join failed.", e);
        }

    }

	preload()
    {
        this.load.setBaseURL('assets');

        this.load.bitmapFont('gameFont', 'fonts/gameFont.png', 'fonts/gameFont.fnt');

        this.cameras.main.backgroundColor = Colors.gameBackground;
        this.load.image('arrow', 'sprites/arrow.png')
    }

    create()
    {
        // cursor
        this.input.setDefaultCursor('url(assets/sprites/cursor.png), pointer');

        const title = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY, 'gameFont', '', 32)
            .setOrigin(0.5)
            .setCenterAlign()
            .setInteractive();

        title.y = 30;
        title.tint = Colors.lightGreen.color32;
        title.setText('Space Shooter v.1');

        this.menuNewGame = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY, 'gameFont', 'New Game', 16)
            .setOrigin(0.5)
            .setCenterAlign()
            .setInteractive();

        this.menuNewGame.tint = Colors.lightGreen.color32;

        this.menuNewGame.on('pointerdown', this.startNewGame, this);
        this.menuNewGame.on('pointerover', this.newGameHover, this);
        this.menuNewGame.on('pointerout', this.newGameExit, this);

        this.menuHighScores = this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY, 'gameFont', 'High Scores', 16)
            .setOrigin(0.5)
            .setCenterAlign()
            .setInteractive();

        this.menuHighScores.y += 40;
        this.menuHighScores.tint = Colors.lightGreen.color32;

        this.menuHighScores.on('pointerdown', this.gotoHighScores, this);
        this.menuHighScores.on('pointerover', this.highScoresHover, this);
        this.menuHighScores.on('pointerout', this.highScoresExit, this);

    }

    newGameHover() {

        if(this.menuNewGame) {
            this.menuNewGame.tint = Colors.white.color32;
        }

    }

    newGameExit() {

        if(this.menuNewGame) {
            this.menuNewGame.tint = Colors.lightGreen.color32;
        }

    }

    startNewGame() {
        this.scene.start('game');
    }

    gotoHighScores() {

        

    }

    highScoresExit() {

        if(this.menuHighScores) {
            this.menuHighScores.tint = Colors.lightGreen.color32;
        }

    }

    highScoresHover() {
       
        if(this.menuHighScores) {
            this.menuHighScores.tint = Colors.white.color32;
        }

    }

    update(){

            

    }

}
