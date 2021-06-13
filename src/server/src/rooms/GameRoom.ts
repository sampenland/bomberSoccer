import { Room, Client } from "colyseus";
import { Player } from "../classes/Player";
import { World } from "../classes/World";
import { IAdjustableSettings, IControls, IGameSettings, IReady } from "../interfaces/IClientServer";
import { GameRoomState } from "./schema/GameRoomState";

export class GameRoom extends Room<GameRoomState> {

  onCreate (options: any) {

    this.setState(new GameRoomState());
    console.log("Created state.");

    this.onMessage("adjustedSettings", (client:Client, settings:IAdjustableSettings) => {

      this.state.gameWorld.updateGoals(settings.goalSize);

      this.state.settings = settings;
      this.state.gameWorld.gameBall.body.frictionAir = settings.airFriction;

      this.state.players.forEach((p) => {
        p.changeSolid(settings.solidPlayers == 1);
        p.bombsAvailable = settings.bombsAvailable;
      });

      this.broadcast("adjustedSettings", settings);

    });

    this.onMessage("setReady", (client:Client, settings:IReady) => {

      let bothPlayersReady = true;
      this.state.players.forEach((player) => {

        if(player.id == client.sessionId) {

          player.ready = settings.ready;

        }

        if(player.ready == false) {
          bothPlayersReady = false;
        }

      });

      if(bothPlayersReady) {
        this.broadcast("startCountdown", {delay:3000});
      }

    });

    this.onMessage("requestStart", (client:Client, gameSettings:IGameSettings) => {

      if((this.clients.length == 2 || gameSettings.testGame) && !this.state.started) {

        this.state.started = true;
        
        // start settings
        this.state.settings = {
          blastRadiusMax: 100,
          blastMagnitude: 0.05,
          explodeTime: 1000,
          gameBallMass: 4,
          bombsAvailable: 10,
          instantBombReset: 5000,
          moveDelay:0,
          solidPlayers: 0,
          goalSize:gameSettings.goalSize,
          airFriction:0.022,
        };

        this.state.gameWorld = new World(gameSettings.gameSize.width, 
          gameSettings.gameSize.height,
          gameSettings.borderSize, 
          gameSettings.goalSize, 
          this.state, this);

        this.broadcast("adjustedSettings", this.state.settings);

        this.state.players[0].setGameWorld(this.state.gameWorld, this.state.settings.bombsAvailable, 26);

        this.state.players[0].positionPlayers(0);
        
        if(this.state.players.length == 1) {
          this.state.players.push(new Player("CPU", "cpu"));
        }

        this.state.players[1].setGameWorld(this.state.gameWorld, this.state.settings.bombsAvailable, 26);
        this.state.players[1].positionPlayers(1);

        this.broadcast("startGame", {
          playerOne: this.state.players[0],
          playerTwo: this.state.players[1],
          gameBall: this.state.gameWorld.gameBall,
        });
        
      }

    });

    this.onMessage("reset", () => {
      this.state.gameWorld.gameBall.reset();

      this.state.players.forEach( (p) => {
        p.bombsAvailable = this.state.settings.bombsAvailable;
        p.reset();
      });

    });

    this.onMessage("removeBomb", (client:Client, message:{playerId:string, bombId:number}) => {

      this.state.players.forEach((player) => {

        if(player.id == message.playerId) {

          player.removeBomb(message.bombId);

        }

      });

    });

    this.onMessage("controls", (client:Client, message:IControls) => {

      this.state.players.forEach((player) => {

        if(player.id == client.sessionId) {

          if(message.middlePressed)
          {
            this.broadcast("opponentPosition", {x:player.x, y:player.y}, {except: client});
            player.setPosition(message.mouseX, message.mouseY);
            player.dropBomb(true);
          }
          

          if(message.leftPressed) {
            this.broadcast("opponentPosition", {x:player.x, y:player.y}, {except: client});
            player.setPosition(message.mouseX, message.mouseY);
            
          }

          if(message.rightPressed) {
            this.broadcast("opponentPosition", {x:player.x, y:player.y}, {except: client});
            player.setPosition(message.mouseX, message.mouseY);
            player.dropBomb();
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
