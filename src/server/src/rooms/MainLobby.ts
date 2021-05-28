import { Room, Client } from "colyseus";
import { InGameRooms } from "../classes/InGameRooms";
import { MainLobbyState } from "./schema/MainLobbyState";

export class MainLobby extends Room<MainLobbyState> {
  
  onCreate (options: any) {

    this.setState(new MainLobbyState());

    // this.onMessage("getGameLobby", async (client:Client, message:any) => {

    //   if(this.presence.get("inGameRooms") == undefined){
    //     let initRooms = new Array<InGameRooms>();
    //     this.presence.sadd("inGameRooms", {rooms:initRooms});
    //   }
      
    //   let inGameRooms = await this.presence.smembers("inGameRooms");

    //   for(let room of inGameRooms){
        
    //     if(room.notFull())
    //     {
    //       client.send("getGameLobby", {roomId: room.roomId});
    //       return;
    //     }

    //   }

    //   client.send("getGameLobby", {roomId: undefined, rooms:this.state.inGameRooms.length});

    // });

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
