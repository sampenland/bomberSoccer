import * as Colyseus from 'colyseus.js'
import {Client} from 'colyseus.js'
import { ILoadout } from '../interfaces/ILoadout';

export class HeroType {
    static count = 2;
    static instant = {name: "Instant", val: 1};
    static gravity = {name: "Gravity", val: 2};
}

export default class GameManager {

    public static debug:boolean = false;

    public static width:number;
    public static height:number;

    public static testName:string = "TESTER";
    public static maxBombs:number = 100;

    public static borderSize = 12;
    public static goalSize = 80;
    
    public static playerName:string;
    public static playerNum:number;

    public static solidPlayers:boolean = false;
    public static airFriction:number;
    public static blastDistance:number;

    public static opponentName:string | undefined = undefined;
    public static opponentId:string | undefined = undefined;
    public static opponentNum:number;

    public static client:Client;
    public static onlineRoom:Colyseus.Room;
    public static connected:Boolean;
    public static gameReady:Boolean = false;

    public static tempNextRoomId:string | undefined;
    public static tempOldRoomId:string;

    public static playerLoadout:ILoadout = {
        coins:1,
        usedCoins:0,
        bombs:10,
        specialBombs: 1,
        hero: HeroType.instant,
        ready: false
    };
    public static opponentLoadout:ILoadout = {
        coins:2,
        usedCoins:0,
        bombs:10,
        specialBombs: 2,
        hero: HeroType.gravity,
        ready: false
    };

    public static changeHero(player:boolean, next:boolean) {

        if(player) {

            let val = GameManager.playerLoadout.hero.val;
            if(next) {

                val++

                if(val > HeroType.count) {
                    val = 1;
                }
            
            } else {

                val++

                if(val > HeroType.count) {
                    val = 1;
                }

            }

            GameManager.playerLoadout.hero = this.getHeroType(val);

        } else {

            let val = GameManager.opponentLoadout.hero.val;
            if(next) {

                val++

                if(val > HeroType.count) {
                    val = 1;
                }
            
            } else {

                val++

                if(val > HeroType.count) {
                    val = 1;
                }

            }

            GameManager.opponentLoadout.hero = this.getHeroType(val);

        }

    }

    private static getHeroType(val:number) {
        if(val == 1) return HeroType.instant;
        if(val == 2) return HeroType.gravity;
        return HeroType.instant;
    }

}