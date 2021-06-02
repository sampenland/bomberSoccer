
export default class RealBomb extends Phaser.GameObjects.Sprite {

    constructor(scene:Phaser.Scene, x:number, y:number, explodeTime:number)
    {
        super(scene, x, y, 'bomb');

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
            repeat: 0
        });

        this.anims.play('bombBurning');
        scene.add.existing(this);

        scene.time.delayedCall(explodeTime, this.explode, [], this);

    }

    explode() {

        this.anims.play('bombExplode');
        this.on('animationcomplete', this.kill, this);

    }

    kill(animation:Phaser.Animations.Animation, frame:number) {

        if(animation.key == 'bombExplode'){
            this.destroy();
        }
    }

}