import Phaser from 'phaser'
import FakeBomb from '../gameObjects/FakeBomb';
import Colors from '../globals/Colors';
import GameManager from '../globals/GameManager';

export default class SplashScreen extends Phaser.Scene
{

	constructor()
	{
		super('splashScreen');
	}

	preload()
    {
        this.load.setBaseURL('assets');
        this.load.html('login', 'html/splashScreen.html');

        this.cameras.main.backgroundColor = Colors.logoBackground;
        this.load.image('logo', 'spinlandIcon.png');
        this.load.spritesheet('player', 'sprites/player.png', {frameWidth: 14, frameHeight: 14});
        this.load.spritesheet('bomb', 'sprites/bomb.png', {frameWidth: 8, frameHeight: 9});

    }

    create()
    {
        console.log('Splash Screen booted.');

        let logo = this.add.image(29, this.cameras.main.height - 29, 'logo');
        this.tweens.add({
            targets: logo, 
            alpha: 0,
            yoyo: true,
            loop: -1
        });

        let player = this.add.sprite(this.cameras.main.centerX - 80, this.cameras.main.centerY - 10, 'player');
        this.anims.create({
            key: 'playerNoBomb',
            frames: this.anims.generateFrameNumbers('player', { frames: [0]}),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'playerWithBomb',
            frames: this.anims.generateFrameNumbers('player', { frames: [1]}),
            frameRate: 4,
            repeat: -1
        });

        player.play('playerWithBomb');

        this.playAnimation(player);

        var element = this.add.dom(this.cameras.main.centerX - 20, 50).createFromCache('login');
        element.addListener('click');

        element.on('click',  (event) => {

            if (event.target.name === 'submitButton')
            {
                var inputUsername = (element.getChildByName('username') as HTMLInputElement).value;

                if(inputUsername != null && inputUsername != ""){

                    GameManager.playerName = inputUsername;
                    this.scene.start('mainMenu');
                }

            }
        });
        
    }

    playAnimation(player:Phaser.GameObjects.Sprite) {

        this.tweens.add({
            targets: player,
            x: this.cameras.main.centerX + 80,
            duration: 4000,
            onComplete: () =>{

                // drop bomb
                let newBomb = new FakeBomb(this, player.x + 12, player.y + player.height/2, 'bomb');

                // change sprite to no bomb and move back
                player.play('playerNoBomb');
                this.tweens.add({
                    targets: player,
                    x: this.cameras.main.centerX - 80,
                    duration: 4000,
                    onComplete: () =>{

                        // change sprite to no bomb and move back
                        player.play('playerWithBomb');
                        this.playAnimation(player);
                    },
                })
            },
        });

    }
}
