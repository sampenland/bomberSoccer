import GameManager from "../globals/GameManager";
import Game from "../scenes/Game";
import Player from "./Player";

export default class RealBomb extends Phaser.GameObjects.Sprite {

    id:number;
    playerId:string;

    constructor(scene:Phaser.Scene, x:number, y:number, id:number, playerId:string)
    {
        super(scene, x, y, 'bomb');

        this.id = id;
        this.playerId = playerId;

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

    }

    explode(scale:number) {

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