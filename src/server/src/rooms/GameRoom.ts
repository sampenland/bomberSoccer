import { Room, Client } from "colyseus";
import { Player } from "../classes/Player";
import { World } from "../classes/World";
import { IGameSettings } from "../interfaces/IClientServer";
import { GameRoomState } from "./schema/GameRoomState";

export class GameRoom extends Room<GameRoomState> {

  onCreate (options: any) {

    this.setState(new GameRoomState());
    console.log("Created state.");

    this.onMessage("requestStart", (client:Client, gameSettings:IGameSettings) => {

      if(this.clients.length == 2 && !this.state.started) {

        this.state.started = true;
        this.state.gameWorld = new World(gameSettings.gameSize.width, gameSettings.gameSize.height,gameSettings.borderSize, gameSettings.goalSize);

        this.state.players.forEach((player) => {
          player.setGameWorld(this.state.gameWorld);
        });

        this.state.players[0].positionPlayers(0);
        this.state.players[1].positionPlayers(1);

        this.broadcast("startGame", {
          playerOne: this.state.players[0],
          playerTwo: this.state.players[1],
          gameBall: this.state.gameWorld.gameBall,
        });
      }

    });

    this.onMessage("removeBomb", (client:Client, message:{playerId:string, bombId:number}) => {

      this.state.players.forEach((player) => {

        if(player.id == message.playerId) {

          player.removeBomb(message.bombId);

        }

      });

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

    let joiningPlayer = new Player(options.playerName, client.sessionId);
    this.state.players.push(joiningPlayer);

  }

  onLeave (client: Client, consented: boolean) {
    console.log(client.sessionId, "left Game Room!");
    this.state.gameWorld.dispose();
    // TODO send dispose to client
  }

  onDispose() {
    console.log("room", this.roomId, "disposing Game Room...");
  }

}
