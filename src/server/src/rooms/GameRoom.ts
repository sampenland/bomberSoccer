import { Room, Client } from "colyseus";
import { Player } from "../classes/Player";
import { GameRoomState } from "./schema/GameRoomState";

export class GameRoom extends Room<GameRoomState> {

  onCreate (options: any) {

    this.setState(new GameRoomState());

    this.onMessage("requestStart", (client:Client, message:any) => {

      if(this.clients.length == 2) {
        this.broadcast("startGame", {playerOneId:this.state.players[0].id, playerTwoId:this.state.players[1].id});
      }

    });

    this.onMessage("requestSync", (client:Client) =>{
      this.broadcast("sync", this.state);
    });

  }

  onJoin (client: Client, options: any) {
    
    console.log(options.playerName + " [" + client.sessionId + "] joined Game Room.");

    if(this.state.players.length == 0) {
      this.state.gameWorld.setSize(360, 180);
    }

    let joiningPlayer = new Player(options.playerName, client.sessionId, this.state.gameWorld);
    this.state.players.push(joiningPlayer);
    this.state.players[this.state.players.length - 1].setPlayerNumber(this.state.players.length);

  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left Game Room!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing Game Room...");
  }

}
