import Phaser from 'phaser'

export default class Player extends Phaser.GameObjects.Sprite
{

    playerNum:number = -1;
    id:string | undefined;

    label:Phaser.GameObjects.Text;

    bombs:number = 10;
    
    maxMoves:number = 2;
    moves:number = 2;
    moveDelay:number = 3000;

    moveTimer:Phaser.GameObjects.Sprite;

    constructor(scene:Phaser.Scene){

        super(scene, -100, -100, 'player');
        this.scene.add.existing(this);

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

        this.label = scene.add.text(-100, -100, '', { fontFamily: 'webFont', fontSize:'12px', color:"#cbffd8" }).setOrigin(0.5, 0);       

    }

    setPlayerName(name:string) {
        this.label.text = name;
    }

    update() 
    {
        this.label.setPosition(this.x, this.y - 20);
        this.moveTimer.setPosition(this.x - this.width * 0.75, this.y);
    }

    updateFramerate() {
        this.moveTimer.anims.get('tick').frameRate = this.moveDelay / (4 / 1/60);
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