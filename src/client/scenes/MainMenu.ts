import Phaser from 'phaser'
import Colors from '../globals/Colors';
import * as Colyseus from 'colyseus.js'
import GameManager from '../globals/GameManager';

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

    menu:Phaser.GameObjects.DOMElement | undefined;

	constructor()
	{
		super('mainMenu');
	}

    async joinMainLobby(){

        try {

            GameManager.onlineRoom = await GameManager.client.joinOrCreate("mainLobby", {playerName: GameManager.playerName});
            console.log("Join passed.", GameManager.onlineRoom);

            GameManager.onlineRoom.onMessage('playerEnter', this.playerEnter);
        
        } catch (e) {
            console.error("Join failed.", e);
        }

    }

    playerEnter(message:any){

        if(message.playerName == null) return;

        GameManager.opponentName = message.playerName;
        if(this.menu){
            this.menu.getChildByID("playerTwo").innerHTML = GameManager.opponentName;
        }
    }

	preload()
    {
        this.load.setBaseURL('assets');
        this.load.html('menu', 'html/mainMenu.html');
        this.load.bitmapFont('gameFont', 'fonts/gameFont.png', 'fonts/gameFont.fnt');

        this.cameras.main.backgroundColor = Colors.gameBackground;
        this.load.image('arrow', 'sprites/arrow.png');
    }

    create()
    {
        console.log('Main Menu booted with playerName = ' + GameManager.playerName);

        this.menu = this.add.dom(this.cameras.main.centerX - 45, 20).createFromCache('menu');
        this.menu.getChildByID("playerOne").innerHTML = GameManager.playerName;
        this.tweens.add({
            targets:this.menu,
            y:10,
            yoyo:true,
            loop:-1
        })

        GameManager.client = new Colyseus.Client("ws://localhost:2567");
        this.joinMainLobby();

    }

    startNewGame() {
        this.scene.start('game');
    }

    update(){

            

    }

}
