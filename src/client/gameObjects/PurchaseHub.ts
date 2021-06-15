import Colors from "../globals/Colors";
import GameManager from "../globals/GameManager";
import Game from "../scenes/Game";

export default class PurchaseHub extends Phaser.GameObjects.Sprite {

    public static turns:number = 0;
    public static purchaseTurnEvery:number = 3;
    drawer:Phaser.GameObjects.Graphics;

    padding:number;

    playerLoadout:Phaser.GameObjects.DOMElement;
    opponentLoadout:Phaser.GameObjects.DOMElement;
    
    playerCoins:Phaser.GameObjects.DOMElement;
    opponentCoins:Phaser.GameObjects.DOMElement;

    playerReadyBtn:Phaser.GameObjects.DOMElement;
    opponentReadyLabel:Phaser.GameObjects.DOMElement;

    updated:boolean = false;
    purchaseHubVisible:boolean = true;

    constructor(scene:Phaser.Scene, padding:number, width:number, height:number) {

        super(scene, padding, padding, 'null');
        this.padding = padding;

        this.drawer = scene.add.graphics();
        this.drawer.setDepth(100);
        this.drawer.setPosition(0, 0);
        this.width = width - padding*2;
        this.height = height - padding*2;

        PurchaseHub.turns = 0;

        this.playerLoadout = scene.add.dom(-500, -500).createFromCache('loadout').setOrigin(0, 0);
        this.playerLoadout.addListener('click');
        this.playerLoadout.on('click', (event) => {

            if(event.target.name == "specialPrevious") {
                GameManager.changeSpecial(true, true);
            } else if(event.target.name == "specialNext") {
                GameManager.changeSpecial(true, false);
            }

            if(event.target.name == "bombsMinus") {
                
                if(GameManager.playerLoadout.usedCoins > 0) {
                    GameManager.playerLoadout.usedCoins--;
                } else if(GameManager.playerLoadout.usedCoins <= 0) {
                    return;
                }

                GameManager.playerLoadout.bombs--;
                if(GameManager.playerLoadout.bombs < 0) GameManager.playerLoadout.bombs = 0;

            } else if(event.target.name == "bombsPlus") {

                if(GameManager.playerLoadout.usedCoins < GameManager.playerLoadout.coins) {
                    GameManager.playerLoadout.usedCoins++;
                } else if(GameManager.playerLoadout.usedCoins >= GameManager.playerLoadout.coins){
                    return;
                }

                GameManager.playerLoadout.bombs++;
                if(GameManager.playerLoadout.bombs > GameManager.maxBombs) GameManager.playerLoadout.bombs = GameManager.maxBombs;
            }

            this.updated = false;
            this.updateDisplay(true);
            GameManager.onlineRoom.send("updateLoadout", {loadout: GameManager.playerLoadout});

        });

        this.opponentLoadout = scene.add.dom(-500, -500).createFromCache('opponentLoadout').setOrigin(0, 0);

        this.playerCoins = scene.add.dom(-500, -500).createFromCache('coinText').setOrigin(0, 0);
        this.opponentCoins = scene.add.dom(-500, -500).createFromCache('coinText').setOrigin(0, 0);

        this.playerReadyBtn = scene.add.dom(-500, -500).createFromCache('readyBtn').setOrigin(0, 0);
        this.opponentReadyLabel = scene.add.dom(-500, -500).createFromCache('readyLabel').setOrigin(0, 0);

        this.playerReadyBtn.addListener('click');
        this.playerReadyBtn.on("click", (event) => {

            if (event.target.name === 'readyBtn')
            {
                GameManager.playerLoadout.ready = !GameManager.playerLoadout.ready;
                if(GameManager.playerLoadout.ready) {
                    (this.playerReadyBtn.getChildByID("readyBtn") as HTMLInputElement).style.color = "#181c28";
                    (this.playerReadyBtn.getChildByID("readyBtn") as HTMLInputElement).style.backgroundColor = "#70d38b";    
                }
                else {
                    (this.playerReadyBtn.getChildByID("readyBtn") as HTMLInputElement).style.color = "#70d38b";
                    (this.playerReadyBtn.getChildByID("readyBtn") as HTMLInputElement).style.backgroundColor = "#181c28";    
                }
                GameManager.onlineRoom.send("setReady", {ready:GameManager.playerLoadout.ready});
            }
            
        });

    }

    position() {

        let PXCoins = GameManager.width/2.3 - this.padding;
        let OXCoins = GameManager.width - this.padding * 3;

        if(Game.player.playerNum == 0) {
            let temp = PXCoins;
            PXCoins = OXCoins;
            OXCoins = temp;
        }

        const yCoins = this.padding * 1.1;

        this.playerCoins.setPosition(PXCoins, yCoins);
        this.opponentCoins.setPosition(OXCoins, yCoins);

        // -----------------------------

        let PXL = GameManager.width/2.3 + this.padding * 1.25;
        let OXL = this.padding * 1.25;

        if(Game.player.playerNum == 0) {

            let tempX = PXL;
            PXL = OXL;
            OXL = tempX;

            this.opponentLoadout.setPosition(PXL, this.padding * 0.75);
            this.playerLoadout.setPosition(OXL, this.padding * 0.75);
        }
        else {
            this.opponentLoadout.setPosition(PXL, this.padding * 0.75);
            this.playerLoadout.setPosition(OXL, this.padding * 0.75);
        }
        
        // ------------------------------

        let readyBtnX = GameManager.width/4;
        let labelX = GameManager.width - this.padding - GameManager.width/4;
        let readyY = GameManager.height - 40;

        if(Game.player.playerNum == 0) {
            let tempX = readyBtnX;
            readyBtnX = labelX;
            labelX = tempX;

            this.playerReadyBtn.setPosition(readyBtnX, readyY);
            this.opponentReadyLabel.setPosition(labelX, readyY);
        }
        else {
            this.playerReadyBtn.setPosition(readyBtnX, readyY);
            this.opponentReadyLabel.setPosition(labelX, readyY);
        }

        this.playerReadyBtn.visible = false;
        this.opponentReadyLabel.visible = false;

    }

    updateDisplay(visible:boolean) {

        if(this.updated) return;

        this.updated = true;

        this.position();
        (this.playerCoins.getChildByID("text") as HTMLSpanElement).innerHTML = "Coins: " + GameManager.playerLoadout.usedCoins + " / " + GameManager.playerLoadout.coins;
        (this.opponentCoins.getChildByID("text") as HTMLSpanElement).innerHTML = "Coins: " + GameManager.opponentLoadout.usedCoins + " / " + GameManager.opponentLoadout.coins;

        (this.playerLoadout.getChildByID("hero") as HTMLSpanElement).innerHTML = GameManager.playerLoadout.special.name;
        (this.playerLoadout.getChildByID("bombs") as HTMLSpanElement).innerHTML = GameManager.playerLoadout.bombs.toString();
        
        (this.opponentLoadout.getChildByID("hero") as HTMLSpanElement).innerHTML = GameManager.opponentLoadout.special.name;
        (this.opponentLoadout.getChildByID("bombs") as HTMLSpanElement).innerHTML = GameManager.opponentLoadout.bombs.toString();

        this.playerCoins.visible = visible;
        this.opponentCoins.visible = visible;
        this.drawer.visible = visible;
        this.playerLoadout.visible = visible;
        this.opponentLoadout.visible = visible;
        this.playerReadyBtn.visible = visible;
        this.opponentReadyLabel.visible = visible;

        GameManager.playerLoadout.ready = !visible;
        if(GameManager.playerLoadout.ready) {
            (this.playerReadyBtn.getChildByID("readyBtn") as HTMLInputElement).style.color = "#181c28";
            (this.playerReadyBtn.getChildByID("readyBtn") as HTMLInputElement).style.backgroundColor = "#70d38b";    
        }
        else {
            (this.playerReadyBtn.getChildByID("readyBtn") as HTMLInputElement).style.color = "#70d38b";
            (this.playerReadyBtn.getChildByID("readyBtn") as HTMLInputElement).style.backgroundColor = "#181c28";    
        }

        GameManager.opponentLoadout.ready = !visible;

        this.purchaseHubVisible = visible;

        if(visible){
            Game.player.label.visible = !visible;
            Game.opponent.label.visible = !visible;
        }

    }

    update() {

        this.drawer.clear();

        if(PurchaseHub.turns % PurchaseHub.purchaseTurnEvery != 0) return;

        this.drawer.fillStyle(Colors.blueGreen.color32, 1);
        this.drawer.fillRect(this.x, this.y, this.width, this.height);

        this.drawer.lineStyle(1, Colors.darkGray.color32, 1);
        this.drawer.lineBetween(GameManager.width/2, 0, GameManager.width/2, GameManager.height);
        
    }


}