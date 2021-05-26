import { Room, Client } from "colyseus";
import { MainLobbyState } from "./schema/MainLobbyState";
import { Player } from "../classes/Player"

export class MainLobby extends Room<MainLobbyState> {

  onCreate (options: any) {

    this.setState(new MainLobbyState());

  }

  onJoin (client: Client, options: any) {
    
    console.log(options.playerName + " [" + client.sessionId + "]", " joined A Main Lobby.");
    this.state.players.set(client.sessionId, new Player(options.playerName));

    if(this.state.players.size == 2) {      
      this.broadcast("playerEnter", {playerName: options.playerName}, { except: client });
      this.state.playerTwo = this.state.players.get(client.sessionId);
      client.send('updateOpponent', {playerName: this.state.playerOne.name});
    }
    else if(this.state.players.size == 1){
      this.state.playerOne = this.state.players.get(client.sessionId);
    }

  }

  onLeave (client: Client, consented: boolean) {
    
    const playerName = this.state.players.get(client.sessionId).name;
    console.log(playerName + "[" + client.sessionId + "] left A Main Lobby!");
  }

  onDispose() {
    console.log("Room [" + this.roomId + "] disposing :: A Main Lobby...");
  }

}
