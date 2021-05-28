import { Schema, type } from "@colyseus/schema";

export class InGameRooms extends Schema {
    
    @type("string")
    roomId:string;

    @type("number")
    playerCount:number;

    constructor(roomId:string) {

        super();
        this.roomId = roomId;

        this.playerCount = 0;

    }

    addPlayer(){
        this.playerCount++;
    }

    removePlayer(){
        this.playerCount--;
    }

    notFull(){
        return this.playerCount < 2;
    }
}