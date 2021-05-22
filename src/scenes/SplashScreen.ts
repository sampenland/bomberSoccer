import Phaser from 'phaser'
import Colors from '~/globals/Colors';

export default class SplashScreen extends Phaser.Scene
{
	constructor()
	{
		super('splashScreen');
        console.log('Splash Screen booted.');
	}

	preload()
    {
        this.cameras.main.backgroundColor = Colors.logoBackground;

        this.load.setBaseURL('assets');
        this.load.image('logo', 'spinlandIcon.png');
    }

    create()
    {
        let logo = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'logo');
        this.tweens.add({
            targets: logo, 
            alpha: 0,
            yoyo: true,
            loop: -1
        });
    }
}
