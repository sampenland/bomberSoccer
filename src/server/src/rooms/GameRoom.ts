import { Room, Client } from "colyseus";
import { GameRoomState } from "./schema/GameRoomState";

export class GameRoom extends Room<GameRoomState> {

  onCreate (options: any) {

    this.setState(new GameRoomState());

  }

  onJoin (client: Client, options: any) {
    
    console.log(client.sessionId, "joined Game Room.");

    if(this.clients.length == 2) {

      this.broadcast('startGame', {});

    }

  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left Game Room!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing Game Room...");
  }

}
