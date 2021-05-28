import Phaser from 'phaser'
import * as Colyseus from 'colyseus.js'
import {Client} from 'colyseus.js'

export default class GameManager {

    public static playerName:string;
    public static opponentName:string | undefined = undefined;
    public static roomId:string | undefined;
    public static client:Client;
    public static onlineRoom:Colyseus.Room;
    public static connected:Boolean;
    public static gameReady:Boolean = false;

}