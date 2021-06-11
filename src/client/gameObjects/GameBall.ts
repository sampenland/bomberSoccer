import GameManager from "../globals/GameManager";
import { ICircle, IRect } from "../interfaces/IClientServer";
import Game from "../scenes/Game";

export default class GameBall extends Phaser.GameObjects.Sprite {

    static debug:boolean = true;

    drawer:Phaser.GameObjects.Graphics;
    radius:number = 1;

    constructor(scene:Phaser.Scene) {

        super(scene, -100, -100, 'gameBall');
        scene.add.existing(this);

        this.drawer = scene.add.graphics();
        this.drawer.lineStyle(1, 0x4e7f7d, 1);

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

    update() {

        this.drawer.clear();
        this.drawer.strokeCircle(this.x, this.y, this.radius);

    }

}