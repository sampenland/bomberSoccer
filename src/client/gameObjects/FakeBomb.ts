
export default class FakeBomb extends Phaser.GameObjects.Sprite {

    constructor(scene:Phaser.Scene, x:number, y:number, noExplode:boolean = false)
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

        if(!noExplode){
            scene.time.delayedCall(2300, this.explode, [], this);
        } else {
            this.anims.stop();
        }

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