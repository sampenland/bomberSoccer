import Phaser from 'phaser'
import GameManager from '../globals/GameManager';

export default class Player extends Phaser.GameObjects.Sprite
{

    static debug:boolean = false;

    playerNum:number = -1;
    id:string | undefined;
    colliderRadius:number = 10;
    drawer:Phaser.GameObjects.Graphics;

    label:Phaser.GameObjects.DOMElement;

    bombs:number = 10;
    
    maxMoves:number = 2;
    moves:number = 2;
    moveDelay:number = 3000;

    moveTimer:Phaser.GameObjects.Sprite;

    constructor(scene:Phaser.Scene){

        super(scene, -100, -100, 'player');
        this.scene.add.existing(this);

        this.drawer = scene.add.graphics();
        this.drawer.lineStyle(2, 0xcbffd8, 0.75);

        this.label = scene.add.dom(0, 0).createFromCache('playerLabel');

        this.moveTimer = new Phaser.GameObjects.Sprite(scene, this.x, this.y, 'moveTimer');
        this.moveTimer.alpha = 0;
        scene.add.existing(this.moveTimer);

        this.moveTimer.anims.create({
            key: 'tick',
            frames: this.anims.generateFrameNumbers('moveTimer', { frames: [0, 1, 2, 3]}),
            frameRate: this.moveDelay / (4 * 600),
            repeat: -1
        });

        this.anims.create({
            key: 'stand',
            frames: this.anims.generateFrameNumbers('player', { frames: [0]}),
            frameRate: 16,
            repeat: -1
        });

        this.anims.create({
            key: 'teleport',
            frames: this.anims.generateFrameNumbers('playerTeleport', { frames: [0, 1, 2, 3, 4, 5, 6, 7, 8 , 9, 10]}),
            frameRate: 60,
            repeat: 0
        });

    }

    setPlayerName(name:string) {
        console.log(this.label);
        (this.label.getChildByID("playerLabel") as HTMLSpanElement).innerHTML = name;
    }

    update() 
    {
        this.label.setPosition(this.x, this.y - this.height);
        this.moveTimer.setPosition(this.x - this.width * 0.75, this.y);

    }

    updateDebugCollider() {

        if(Player.debug) {
            this.drawer.clear();
            this.drawer.strokeCircle(this.x, this.y, this.colliderRadius);
        }

    }

    updateFramerate() {
        this.moveTimer.anims.get('tick').frameRate = 4 / (this.moveDelay / 1000);
    }

    teleport() {

        this.moves--;

        if(this.moves == 0) {

            this.moveTimer.alpha = 1;
            this.moveTimer.play("tick");

            setTimeout(() => {
                
                this.moves = this.maxMoves;
                this.moveTimer.alpha = 0;

            }, this.moveDelay);
        }

        this.anims.play("teleport");
        this.on('animationcomplete', () => {
            this.anims.play("stand");
        }, this);

    }

}