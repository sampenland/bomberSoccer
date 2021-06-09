import { Schema, type } from "@colyseus/schema";
import { Room } from "colyseus";
import Matter from "matter-js";
import { GameRoomState } from "../rooms/schema/GameRoomState";
import { World } from "./World";

export class Player extends Schema {
    
    @type("string")
    name:string;

    @type("string")
    id:string;

    @type("number")
    playerNumber:number = -1;

    @type("number")
    x:number;

    @type("number")
    y:number;

    @type(World)
    gameWorld:World;

    @type("number")
    bombsAvailable:number;

    @type("number")
    score:number = 0;

    @type("number")
    instantBombsAvailable:number = 1;
    canDropInstant:boolean = true;

    body:Matter.Body;

    placedBombs:Array<number>;

    constructor(name:string, id:string) {

        super();
        this.name = name;
        this.id = id;
        this.placedBombs = new Array<number>();

    }

    setGameWorld(world:World, bombsAvailable:number) {
        this.gameWorld = world;
        this.bombsAvailable = bombsAvailable;
        this.body = Matter.Bodies.circle(40, 90, 26 * World.scaleCorrection, {isStatic: true});
        Matter.Composite.add(this.gameWorld.pWorld, this.body);
        this.changeSolid(this.gameWorld.state.settings.solidPlayers == 1);
    }

    changeSolid(isSolid:boolean) {
        this.body.isSensor = !isSolid;
    }

    positionPlayers(num:number) {
        
        this.playerNumber = num;
        
        if(num == 0) {
            this.x = 40;
            this.y = this.gameWorld.centerY()
        }
        else if(num == 1) {
            this.x = this.gameWorld.width - 40;
            this.y = this.gameWorld.centerY();
        }

        Matter.Body.setPosition(this.body, {x:this.x, y:this.y});

    }

    scoreGoal() {
        this.gameWorld.gameBall.reset();
        this.score++;
    }

    setPosition(x:number, y:number) {
        
        this.x = x;
        this.y = y;
        Matter.Body.setPosition(this.body, {x:this.x, y:this.y});
    }

    removeBomb(id:number) {
        this.placedBombs.splice(this.placedBombs.indexOf(id), 1);
    }

    dropBomb(room:Room<GameRoomState>, instant?:boolean) {
        
        if(instant && this.canDropInstant) 
        {
            this.canDropInstant = false;
            setTimeout(() => {
                this.canDropInstant = true;
            }, this.gameWorld.state.settings.instantBombReset);
        }
        else if(instant && !this.canDropInstant)
        {
            return;
        }
        else
        {
            if(this.bombsAvailable != -1)
            {
                if(this.bombsAvailable < 1) {
                    return;
                }
                else
                {
                    this.bombsAvailable--;
                }
            }
        }

        

        let hasId = false;
        let id = -1;
        let cnt = 0;
        while(hasId == false){
            if(!this.placedBombs.includes(cnt)){
                id = cnt;
                hasId = true;
                break;
            }
            cnt++;
        }

        if(id == -1) return;

        this.placedBombs.push(id);
        let bombX = this.x;
        let bombY = this.y;

        room.broadcast("bombDrop", {
            player:this,
            bombId: id,
        });

        let explodeTime = this.gameWorld.state.settings.explodeTime;
        if(instant) explodeTime = 10;

        setTimeout(this.explodeBomb, explodeTime, room, id, bombX, bombY);

    }

    explodeBomb(room:Room<GameRoomState>, id:string, bombX:number, bombY:number) {

        let scaleConstant = 12;
        room.broadcast("explodeBomb", {bombId:id, explodeScale:room.state.settings.blastRadiusMax/scaleConstant});
        room.state.gameWorld.gameBall.applyImpulse({x: bombX, y: bombY});

    }

}