import { Schema, MapSchema, type } from "@colyseus/schema";
import { InGameRooms } from "../../classes/InGameRooms";

export class MainLobbyState extends Schema {

    @type([InGameRooms])
    inGameRooms:Array<InGameRooms>;

}
