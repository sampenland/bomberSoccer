import Phaser from 'phaser'
import Colors from '../globals/Colors';
import GameManager from '../globals/GameManager';

export default class MainMenu extends Phaser.Scene
{
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

	preload()
    {
        this.load.setBaseURL('assets');
        this.load.html('menu', 'html/mainMenu.html');
        this.load.bitmapFont('gameFont', 'fonts/gameFont.png', 'fonts/gameFont.fnt');

        this.cameras.main.backgroundColor = Colors.gameBackground;
        this.load.image('arrow', 'sprites/arrow.png');

    }

    async joinGameLobbyWithID(roomId:string){

        try {

            GameManager.onlineRoom = await GameManager.client.joinById(roomId, {playerName: GameManager.playerName});
            
            GameManager.onlineRoom.onMessage('updateOpponent', this.updateOpponent.bind(this, this));
            GameManager.onlineRoom.send("getOpponent", {playerName: GameManager.playerName});

            GameManager.connected = true;
            console.log("Joined game lobby.", GameManager.onlineRoom);
        
        } catch (e) {
            GameManager.connected = false;
            console.error("Failed to join game lobby.", e);
        }

    }

    async joinGameLobby(){

        try {

            GameManager.onlineRoom = await GameManager.client.create("gameLobby", {playerName: GameManager.playerName});
            
            GameManager.onlineRoom.onMessage('updateOpponent', this.updateOpponent.bind(this, this));
            GameManager.onlineRoom.onMessage('gotoGameRoom', this.gotoGameRoom.bind(this, this));
            GameManager.onlineRoom.onMessage('createGameRoom', this.createGameRoom.bind(this, this));
            GameManager.onlineRoom.send("getOpponent", {playerName: GameManager.playerName});
            
            GameManager.connected = true;
            console.log("Joined game lobby.", GameManager.onlineRoom);
        
        } catch (e) {
            GameManager.connected = false;
            console.error("Failed to join game lobby.", e);
        }

    }

    async createGameRoom(scene:this, data:any) {

        let oldRoom = GameManager.onlineRoom;
        GameManager.onlineRoom = await GameManager.client.create("gameRoom", {playerName: GameManager.playerName});
        oldRoom.send("bringOtherPlayer", {roomId:GameManager.roomId});

        scene.scene.start('game');

    }

    async gotoGameRoom(scene:this, data:any) {

        GameManager.onlineRoom = await GameManager.client.joinById(data.roomId);
        scene.scene.start('game');

    }

    create()
    {        
        GameManager.gameReady = false;
        
        if(GameManager.roomId == undefined) {
            this.joinGameLobby();
        } else {
            this.joinGameLobbyWithID(GameManager.roomId as string);
        }

        GameManager.onlineRoom.send("getOpponent", {playerName: GameManager.playerName});
            
        console.log('Main Menu booted with playerName = ' + GameManager.playerName);
        console.log('Inside roomId: ' + GameManager.onlineRoom.id);

        this.menu = this.add.dom(this.cameras.main.centerX - 45, 20).createFromCache('menu');
        this.menu.getChildByID("playerOne").innerHTML = GameManager.playerName;
        this.tweens.add({
            targets:this.menu,
            y:10,
            yoyo:true,
            loop:-1
        });

        this.getOpponent();

    }

    getOpponent() {

        this.time.delayedCall(1000, () => {
            
            GameManager.onlineRoom.send("getOpponent", {playerName: GameManager.playerName});
            
            if(GameManager.opponentName == undefined)
            {
                this.getOpponent();
            }
            else
            {
                this.enterGame();
            }


        }, [], this);

    }

    enterGame(){

        this.scene.start('game');

    }

    updateOpponent(scene:this, data:{opponentName:string}){

        console.log("client got opponent: " + data.opponentName);
        GameManager.opponentName = data.opponentName;
        if(scene.menu){
            scene.menu.getChildByID("playerTwo").innerHTML = GameManager.opponentName;
        }
    }

    startNewGame() {
        this.scene.start('game');
    }

    update(){

            

    }

}
