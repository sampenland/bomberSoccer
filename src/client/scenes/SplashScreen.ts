import Phaser from 'phaser'
import Colors from '../globals/Colors';

export default class SplashScreen extends Phaser.Scene
{
    public static playerName:string;

    rexUI: any;

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
        this.load.spritesheet('spaceShip', 'sprites/player.png', {frameWidth: 12, frameHeight: 12});

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

        let spaceShip = this.add.image(this.cameras.main.centerX - 60, this.cameras.main.centerY - 10, 'spaceShip');
        this.tweens.add({
            targets: spaceShip,
            x: this.cameras.main.centerX + 60,
            yoyo: true,
            loop: -1
        });

        var element = this.add.dom(this.cameras.main.centerX - 20, 50).createFromCache('login');
        element.addListener('click');

        element.on('click',  (event) => {

            if (event.target.name === 'submitButton')
            {
                var inputUsername = element.getChildByName('username');
                console.log(inputUsername);
            }
        });
        
    }
}
