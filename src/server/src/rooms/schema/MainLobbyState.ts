import { Schema, MapSchema, type } from "@colyseus/schema";

export class MainLobbyState extends Schema {

    @type("string")
    roomId:string;

}
