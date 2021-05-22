import Phaser from 'phaser'
import SplashScreen from './scenes/SplashScreen'

const config:Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 360,
	height: 180,
	pixelArt: true,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 }
		}
	},
	scene: [SplashScreen]
}

export default new Phaser.Game(config)
