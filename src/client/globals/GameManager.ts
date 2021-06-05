import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'
import {Client} from 'colyseus.js'

export default class GameManager {

    public static width:number;
    public static height:number;

    public static testName:string = "TESTER";

    public static borderSize = 5;
    public static goalSize = 50;
    
    public static playerName:string;
    public static playerNum:number;

    public static opponentName:string | undefined = undefined;
    public static opponentId:string | undefined = undefined;
    public static opponentNum:number;

    public static client:Client;
    public static onlineRoom:Colyseus.Room;
    public static connected:Boolean;
    public static gameReady:Boolean = false;

    public static tempNextRoomId:string | undefined;
    public static tempOldRoomId:string;

}