export default class GameBall extends Phaser.GameObjects.Sprite {

    constructor(scene:Phaser.Scene) {

        super(scene, -100, -100, 'gameBall');
        scene.add.existing(this);

    }

}