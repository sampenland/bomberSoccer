import { Room, Client } from "colyseus";
import { MainLobbyState } from "./schema/MainLobbyState";
import { Player } from "../classes/Player"

export class MainLobby extends Room<MainLobbyState> {

  onCreate (options: any) {

    this.setState(new MainLobbyState());

    this.onMessage("getGameLobby", (client:Client, message:any) => {

      this.state.inGameRooms.forEach((room) =>{

        if(room.notFull())
        {
          client.send("getGameLobby", {roomId: room.roomId});
          return;
        }

      });

      client.send("getGameLobby", {roomId: undefined, rooms:this.state.inGameRooms.length});

    });

  }

  onJoin (client: Client, options: any) {
    
    console.log("[" + client.sessionId + "]", " joined Main Lobby.");

  }

  onLeave (client: Client, consented: boolean) {
    
    console.log("[" + client.sessionId + "] left Main Lobby!");
  }

  onDispose() {
    console.log("Room [" + this.roomId + "] disposing :: Main Lobby...");
  }

}
