import { Room, Client } from "colyseus";
import { MainLobbyState } from "./schema/MainLobbyState";

export class MainLobby extends Room<MainLobbyState> {
  
  onCreate (options: any) {

    this.setState(new MainLobbyState());

  }

  onJoin (client: Client, options: any) {
    
    console.log("[" + client.sessionId + "]", " joined Main Lobby.");
    this.state.roomId = this.roomId;

  }

  onLeave (client: Client, consented: boolean) {
    
    console.log("[" + client.sessionId + "] left Main Lobby!");
  }

  onDispose() {
    console.log("Room [" + this.roomId + "] disposing :: Main Lobby...");
  }

}
