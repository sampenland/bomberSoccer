import 'regenerator-runtime/runtime'
import Phaser from 'phaser'
import Game from './scenes/Game';
import MainMenu from './scenes/MainMenu'
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
        default: 'matter',
        matter: {
            gravity: {
                y: 0
            },
            debug: true
        }
    },
	parent: 'phaser-container',
	dom: {
        createContainer: true
    },
	callbacks:{
		postBoot: function(game){
			game.canvas.style.margin = "0px";
			game.canvas.style.width = "100%";
			game.canvas.style.height = "100%";
		}
	},
	scene: [SplashScreen, MainMenu, Game]
}

export default new Phaser.Game(config)
