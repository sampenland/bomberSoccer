import Phaser, { Game } from 'phaser'
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
            GameManager.onlineRoom.onMessage('createGameRoom', this.createGameRoom.bind(this, this));

            GameManager.connected = true;
            console.log("Joined game lobby.", GameManager.onlineRoom);
        
            this.getOpponent();

        } catch (e) {
            GameManager.connected = false;
            console.error("Failed to join game lobby.", e);
        }

    }

    async joinGameLobby(){

        if(GameManager.playerName == GameManager.testName) {

            GameManager.opponentId = "cpu";
            GameManager.opponentName = "CPU";
            
            try
            {
                GameManager.onlineRoom = await GameManager.client.create("gameRoom", {playerName: GameManager.playerName});
                this.scene.start("game");

            }
            catch(e)
            {
                console.log("Failed to join created Game Room");
            }

        }
        else
        {
            try {

                GameManager.onlineRoom = await GameManager.client.create("gameLobby", {playerName: GameManager.playerName});
                
                GameManager.onlineRoom.onMessage('updateOpponent', this.updateOpponent.bind(this, this));
                GameManager.onlineRoom.onMessage('gotoGameRoom', this.gotoGameRoom.bind(this, this));
                GameManager.onlineRoom.onMessage('createGameRoom', this.createGameRoom.bind(this, this));
                
                GameManager.connected = true;
                console.log("Joined game lobby.", GameManager.onlineRoom);
            
                this.getOpponent();
    
            } catch (e) {
                GameManager.connected = false;
                console.error("Failed to join game lobby.", e);
            }
        }

    }

    createGameRoom(scene:this, data:any) {

        this.time.delayedCall(3000, async () => {

            let oldRoom = GameManager.onlineRoom;
            try
            {
                GameManager.onlineRoom = await GameManager.client.create("gameRoom", {playerName: GameManager.playerName});
                console.log(GameManager.playerName + " creating the game room.");
                scene.scene.start("game");
                oldRoom.send("bringOtherPlayer", {roomId:GameManager.onlineRoom.id, roomName:GameManager.onlineRoom.name});

            }
            catch(e)
            {
                console.log("Failed to join created Game Room");
            }

        })

    }

    async gotoGameRoom(scene:this, data:any) {

        console.log(GameManager.playerName + " being pulled into game room: [" + data.roomName + "]" + data.roomId);
        
        try
        {
            GameManager.onlineRoom = await GameManager.client.joinById(data.roomId, {playerName:GameManager.playerName});
            scene.scene.start("game");
        }
        catch(e)
        {
            console.log('Failed to go to game room');
        }
        

    }

    create()
    {        
        GameManager.gameReady = false;
        
        if(GameManager.tempNextRoomId == undefined) {
            this.joinGameLobby();
        } else {
            this.joinGameLobbyWithID(GameManager.tempNextRoomId as string);
        }
            
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

    }

    getOpponent() {

        this.time.delayedCall(1000, () => {
            
            console.log(GameManager.onlineRoom.name);
            GameManager.onlineRoom.send("getOpponent", {playerName: GameManager.playerName});
            
            if(GameManager.opponentName == undefined)
            {
                this.getOpponent();
            }


        }, [], this);

    }

    updateOpponent(scene:this, data:{opponentName:string, opponentId:string}){

        GameManager.opponentName = data.opponentName;
        GameManager.opponentId = data.opponentId;

        if(scene.menu){
            scene.menu.getChildByID("playerTwo").innerHTML = GameManager.opponentName;
        }
    }

}
