import { Room, Client } from "colyseus";
import { Dispatcher } from "@colyseus/command";
import { Player } from "../classes/Player";
import { GameRoomState } from "./schema/GameRoomState";

export class GameRoom extends Room<GameRoomState> {

  onCreate (options: any) {

    this.setState(new GameRoomState());
    console.log("Created state.");

    this.onMessage("requestStart", (client:Client, message:any) => {

      if(this.clients.length == 2) {

        this.broadcast("startGame", {
          playerOne: this.state.players[0],
          playerTwo: this.state.players[1],
        });
      }

    });

    this.onMessage("controls", (client:Client, message:{up:boolean, down:boolean, left:boolean, right:boolean, space:boolean}) => {

      this.state.players.forEach((player) => {

        if(player.id == client.sessionId) {

          let moveSpeed = 2;

          if(message.up) {
            player.moveUp(moveSpeed);
          }

          if(message.down) {
            player.moveDown(moveSpeed);
          }

          if(message.left) {
            player.moveLeft(moveSpeed);
          }

          if(message.right) {
            player.moveRight(moveSpeed);
          }

          if(message.space) {
            player.dropBomb(this);
          }

        }

      });

    });

  }

  onJoin (client: Client, options: any) {
    
    console.log(options.playerName + " [" + client.sessionId + "] joined Game Room.");

    if(this.state.players.length == 0) {
      this.state.gameWorld.setSize(360, 180);
    }

    console.log(client.sessionId);
    let joiningPlayer = new Player(options.playerName, client.sessionId, this.state.gameWorld);
    this.state.players.push(joiningPlayer);
    this.state.players[this.state.players.length - 1].positionPlayers(this.state.players.length);

  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left Game Room!");
  }

  onDispose() {
    console.log("room", this.roomId, "disposing Game Room...");
  }

}
