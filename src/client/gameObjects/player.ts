import Phaser from 'phaser'

export default class Player extends Phaser.GameObjects.Sprite
{

    playerNum:number = -1;

    constructor(scene:Phaser.Scene){

        super(scene, -1, -1, 'player');
        this.scene.add.existing(this);

    }

}