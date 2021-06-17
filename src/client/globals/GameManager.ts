import * as Colyseus from 'colyseus.js'
import {Client} from 'colyseus.js'
import { ILoadout } from '../interfaces/ILoadout';

export class SpecialType {
    
    static count = 2;
    static instant = {name: "Instanta", val: 1};
    static inverter = {name: "Inverter", val: 2};

    static getSpecialType(val:number) {
        if(val == 1) return SpecialType.instant;
        if(val == 2) return SpecialType.inverter;
        return SpecialType.instant;
    }
}

export default class GameManager {

    public static debug:boolean = true;
    public static netcode:boolean = false;

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
        bombs:6,
        special: SpecialType.instant,
        ready: false
    };
    public static opponentLoadout:ILoadout = {
        coins:2,
        usedCoins:0,
        bombs:6,
        special: SpecialType.inverter,
        ready: false
    };

    public static changeSpecial(player:boolean, next:boolean) {

        if(player) {

            let val = GameManager.playerLoadout.special.val;
            if(next) {

                val++

                if(val > SpecialType.count) {
                    val = 1;
                }
            
            } else {

                val++

                if(val > SpecialType.count) {
                    val = 1;
                }

            }

            GameManager.playerLoadout.special = SpecialType.getSpecialType(val);

        } else {

            let val = GameManager.opponentLoadout.special.val;
            if(next) {

                val++

                if(val > SpecialType.count) {
                    val = 1;
                }
            
            } else {

                val++

                if(val > SpecialType.count) {
                    val = 1;
                }

            }

            GameManager.opponentLoadout.special = SpecialType.getSpecialType(val);

        }

    }

}