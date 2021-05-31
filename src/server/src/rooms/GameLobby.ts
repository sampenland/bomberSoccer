import { Room, Client } from "colyseus";
import { Player } from "../classes/Player"
import { GameLobbyState } from "./schema/GameLobbyState";

export class GameLobby extends Room<GameLobbyState> {

  onCreate (options: any) {

    this.setState(new GameLobbyState());

    this.onMessage('getOpponent', (client:Client, message:any) => {

      if(this.state.players == undefined) return;

      let otherName = this.state.players[0].name;
      let otherId = this.state.players[0].id;

      if(otherName == message.playerName) {
        if(this.state.players.length < 2) return;
        otherName = this.state.players[1].name;
        otherId = this.state.players[1].id;
      }

      client.send("updateOpponent", {opponentName:otherName, opponentId:otherId});

    });

    this.onMessage("bringOtherPlayer", (client:Client, message:any) => {

      this.broadcast("gotoGameRoom", {roomId:message.roomId, roomName:message.roomName}, {except: client});

    });

  }

  onJoin (client: Client, options: any) {
    
    console.log(options.playerName + " [" + client.sessionId + "]", " joined a Game Lobby.");
    this.state.players.push(new Player(options.playerName, client.sessionId));

    console.log('Clients in Game lobby: ' + this.clients.length);
    if(this.clients.length == 2) {
      client.send("createGameRoom", {});
    }

  }

  onLeave (client: Client, consented: boolean) {
    
    let playerName = "";
    for(var i= 0; i< this.state.players.length; i ++) {
      if(this.state.players[i].id == client.sessionId){
        playerName = this.state.players[i].name;
        break;
      }
    }

    console.log(playerName + "[" + client.sessionId + "] left A Main Lobby!");

  }

  onDispose() {
    console.log("Room [" + this.roomId + "] disposing :: A Main Lobby...");
  }

}
