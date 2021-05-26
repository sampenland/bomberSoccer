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
    
    console.log(options.playerName + " [" + client.sessionId + "]", "joined Main Lobby.");
    this.state.players.set(client.sessionId, new Player(options.playerName));

    if(this.state.players.size == 2) {      
      this.broadcast("playerEnter", {playerName: options.playerName}, { except: client });
    }

  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left Main Lobby!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing Main Lobby...");
  }

}
