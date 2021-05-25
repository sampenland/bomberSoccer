import Phaser from 'phaser'
import Colors from '../globals/Colors';

export default class SplashScreen extends Phaser.Scene
{
	constructor()
	{
		super('splashScreen');
        console.log('Splash Screen booted.');
	}

	preload()
    {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });
        
        this.load.plugin('rextexteditplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexteditplugin.min.js', true);
    

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
            yoyo: true
        });

        const text = this.add.text(this.cameras.main.centerX + 12, this.cameras.main.centerY + 30, 'Enter Name', { fixedWidth: 125, fixedHeight: 20 });
        text.setOrigin(0.5, 0.5);
        text.setFontSize(18);

        text.setInteractive().on('pointerdown', () => {
            this.rexUI.edit(text);
        });
    }

    nextScene() {

        this.scene.start("mainMenu");

    }
}
