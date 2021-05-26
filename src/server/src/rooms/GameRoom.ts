import { Room, Client } from "colyseus";
import { Player } from "../classes/Player"
import { GameRoomState } from "./schema/GameRoomState";

export class GameRoom extends Room<GameRoomState> {

  onCreate (options: any) {

    this.setState(new GameRoomState());

    // listeners
    this.onMessage("type", (client, message) => {
      
      

    });

  }

  onJoin (client: Client, options: any) {
    
    console.log(client.sessionId, "joined Game Room.");

  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left Game Room!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing Game Room...");
  }

}
