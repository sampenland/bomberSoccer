import { Room, Client } from "colyseus";
import { MainLobbyState } from "./schema/MainLobbyState";
import { Player } from "../classes/Player"

export class MainLobby extends Room<MainLobbyState> {

  onCreate (options: any) {

    this.setState(new MainLobbyState());

    // listeners
    this.onMessage("type", (client, message) => {
      
      

    });

  }

  onJoin (client: Client, options: any) {
    
    console.log(client.sessionId, "joined Main Lobby!");
    this.state.players.set(client.sessionId, new Player(client.sessionId));

  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left Main Lobby!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing Main Lobby...");
  }

}
