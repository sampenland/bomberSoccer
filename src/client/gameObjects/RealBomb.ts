import Colors from "../globals/Colors";
import GameManager from "../globals/GameManager";
import Game from "../scenes/Game";
import Player from "./Player";

export default class RealBomb extends Phaser.GameObjects.Sprite {

    id:number;
    playerId:string;
    drawer:Phaser.GameObjects.Graphics;
    trajectory:Phaser.GameObjects.Graphics;
    explodeSizeStart:number = 12;
    explodeDuration:number = 100;

    constructor(scene:Phaser.Scene, x:number, y:number, id:number, playerId:string, explodeDelay:number)
    {
        super(scene, x, y, 'bomb');

        this.id = id;
        this.playerId = playerId;

        this.drawer = scene.add.graphics();
        this.drawer.lineStyle(1, 0x4e7f7d, 1);
        this.trajectory = scene.add.graphics();
        this.trajectory.lineStyle(1, 0x4e7f7d, 1);
        this.trajectory.setPosition(0, 0);

        this.anims.create({
            key: 'bombBurning',
            frames: this.anims.generateFrameNumbers('bomb', { frames: [0, 1, 2, 3, 4, 5, 6, 7]}),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'bombExplode',
            frames: this.anims.generateFrameNumbers('bombExplode', {frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}),
            frameRate: 15,
            repeat: 0,
        });

        this.anims.play('bombBurning');
        scene.add.existing(this);

        this.scene.tweens.addCounter({
            to: 0,
            from: 50,
            duration: explodeDelay,
            onUpdate: (v) => {

                this.drawer.clear();
                this.drawer.lineStyle(1, 0x4e7f7d, 1);
                this.drawer.strokeCircle(this.x, this.y, v.getValue());
                this.trajectory.clear();   
                
                let dir = {x:0, y:0};

                const distance = Math.sqrt(Math.pow((this.x - Game.gameBall.x),2) + Math.pow((this.y - Game.gameBall.y), 2));

                if(distance <= GameManager.blastDistance)
                {
                    dir.x = (Game.gameBall.x - this.x) * 2;
                    dir.y = (Game.gameBall.y - this.y) * 2;
                    
                    this.trajectory.lineBetween(this.x, this.y, Game.gameBall.x + dir.x, Game.gameBall.y + dir.y);
                }

            },
            onComplete: () => {
                this.drawer.clear();
                this.trajectory.clear();
            },
        });


    }

    explode(scale:number) {
        
        this.visible = false;
        this.scene.tweens.addCounter({
            to: this.explodeSizeStart * scale,
            from: this.explodeSizeStart,
            duration: this.explodeDuration,
            onUpdate: (v) => {
                this.drawer.clear();
                this.drawer.fillStyle(Colors.white.color32, 1);
                this.drawer.fillCircle(this.x, this.y, v.getValue());
            },
            onComplete: () => {
                this.drawer.clear();
                this.destroy();
            }
        });

        return;
        // old bomb explosion

        if(this.anims != undefined) {
            this.scale = scale;
            this.alpha = 0.2;
            this.anims.play('bombExplode');
        }
        
        if(Game.player.id == this.playerId) {
            GameManager.onlineRoom.send("removeBomb", {playerId:this.playerId, bombId:this.id});
        }

        this.on('animationcomplete', this.kill, this);

    }

    kill(animation:Phaser.Animations.Animation, frame:number) {

        if(animation.key == 'bombExplode'){
            this.destroy();
        }
    }

}