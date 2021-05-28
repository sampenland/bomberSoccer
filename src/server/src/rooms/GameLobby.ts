import { Room, Client } from "colyseus";
import { InGameRooms } from "../classes/InGameRooms";
import { Player } from "../classes/Player"
import { GameLobbyState } from "./schema/GameLobbyState";

export class GameLobby extends Room<GameLobbyState> {

  onCreate (options: any) {

    this.setState(new GameLobbyState());

    this.onMessage('getOpponent', (client:Client, message:any) => {

      if(this.state.players == undefined) return;

      let otherName = this.state.players[0].name;

      if(otherName == message.playerName) {
        if(this.state.players.length < 2) return;
        otherName = this.state.players[1].name;
      }

      client.send("updateOpponent", {opponentName:otherName});

    });

  }

  onJoin (client: Client, options: any) {
    
    console.log(options.playerName + " [" + client.sessionId + "]", " joined A Main Lobby.");
    this.state.players.push(new Player(options.playerName, client.sessionId));

    let inGameRooms = this.presence.get("inGameRooms").rooms as Array<InGameRooms>;
    let foundRoom = this.getRoomFromInGameRooms(inGameRooms);

    if(foundRoom != undefined)
    {
      foundRoom.addPlayer();
    }
    else 
    {
      let newRoom:InGameRooms = new InGameRooms(this.roomId);
      inGameRooms.push(newRoom);
    }

  }

  getRoomFromInGameRooms(inGameRooms:Array<InGameRooms>)
  {
    if(inGameRooms == undefined) {
      console.log("Cannot get inGameRooms from presence...");
      return;
    }

    let foundRoom:InGameRooms | undefined;
    for(let room of inGameRooms)
    {
      if(room.roomId == this.roomId){
        foundRoom = room;
      }
    }

    return foundRoom;
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

    let inGameRooms = this.presence.get("inGameRooms").rooms as Array<InGameRooms>;
    let foundRoom = this.getRoomFromInGameRooms(inGameRooms);

    if(foundRoom != undefined)
    {
      foundRoom.removePlayer();
    }

  }

  onDispose() {
    console.log("Room [" + this.roomId + "] disposing :: A Main Lobby...");
  }

}
