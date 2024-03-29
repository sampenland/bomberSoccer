import GameManager from "../globals/GameManager";
import Game from "../scenes/Game";
import PurchaseHub from "./PurchaseHub";

export default class GameBall extends Phaser.GameObjects.Sprite {

    static debug:boolean = true;

    drawer:Phaser.GameObjects.Graphics;
    radius:number = 1;
    velocityX:number;
    velocityY:number;

    label:Phaser.GameObjects.DOMElement;

    phyBody:Phaser.Physics.Matter.Image;

    lerpSpeed:number = 0.90;

    netX:number = -100;
    netY:number = -100;

    constructor(scene:Phaser.Scene) {

        super(scene, -100, -100, '');
        this.netX = GameManager.width/2;
        this.netY = GameManager.height/2;
        
        this.visible = false;
        
        scene.add.existing(this);
        this.velocityX = 0;
        this.velocityY = 0;

        this.drawer = scene.add.graphics();
        this.drawer.lineStyle(1, 0x4e7f7d, 1);

        this.label = scene.add.dom(0, 0).createFromCache('text').setOrigin(0, 0);
        this.label.setPosition(15, GameManager.height - 15);

        this.phyBody = scene.matter.add.image(GameManager.width/2, GameManager.height/2, 'null').setOrigin(0.5, 0.5);
        this.phyBody.visible = false;
        scene.add.existing(this.phyBody);

    }

    findBestPosition(clickX:number, clickY:number) {

        const dist_points = (clickX - this.x) * (clickX - this.x) + (clickY - this.y) * (clickY - this.y);
        const r = this.radius * this.radius;
        const needsChanging = dist_points < r;
        
        if(!needsChanging) {
            return {x: clickX, y:clickY};
        }

        // find best pos
        let dir = {x:0, y:0};

        dir.x = Game.player.x - this.x;
        dir.y = Game.player.y - this.y;

        const m = Math.sqrt( Math.pow(dir.x,2) + Math.pow(dir.y,2));
        dir.x /= m;
        dir.y /= m;

        const padding = 5;
        dir.x = this.x + ((this.radius + padding) * dir.x);
        dir.y = this.y + ((this.radius + padding)* dir.y);

        return dir;

    }

    updateNetPosition(x:number, y:number, velX:number, velY:number) {

        this.phyBody.setVelocity(velX, velY);

        if(this.netX == this.phyBody.x && this.netY == this.phyBody.y) return;

        this.netX = x;
        this.netY = y;

    }

    update() {

        this.phyBody.x = Phaser.Math.Linear(this.phyBody.x, this.netX, this.lerpSpeed);
        this.phyBody.y = Phaser.Math.Linear(this.phyBody.y, this.netY, this.lerpSpeed);

        this.x = this.phyBody.x;
        this.y = this.phyBody.y;

        this.drawer.clear();
        
        this.drawer.fillStyle(0xcbffd8, 1);
        if(!PurchaseHub.purchaseHubVisible) 
        {
            this.drawer.fillCircle(this.x, this.y, this.radius);
            this.drawer.lineBetween(this.x, this.y, this.x + this.velocityX * 100, this.y + this.velocityY * 100);
        }

        if(GameManager.debug) {

            const vX = Math.round(this.velocityX * 100) / 100;
            const vY = Math.round(this.velocityY * 100) / 100;
            (this.label.getChildByID("text") as HTMLSpanElement).innerHTML = "x: " + vX + ", " + vY;

        } else {
            (this.label.getChildByID("text") as HTMLSpanElement).innerHTML = "";
        }

    }

}