import Phaser from 'phaser'

interface playerConfig {scene:Phaser.Scene, x:number, y:number};

export default class Player extends Phaser.GameObjects.Sprite
{

    constructor(config:playerConfig){

        super(config.scene, config.x, config.y, 'player');
        this.scene.add.existing(this);

    }

}