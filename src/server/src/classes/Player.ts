import { Schema, type } from "@colyseus/schema";
import { Room } from "colyseus";
import { GameRoomState } from "../rooms/schema/GameRoomState";
import { World } from "./World";

export class Player extends Schema {
    
    @type("string")
    name:string;

    @type("string")
    id:string;

    @type("number")
    x:number;

    @type("number")
    y:number;

    @type("number")
    angle:number;

    @type(World)
    gameWorld:World;

    placedBombs:Array<number>;

    constructor(name:string, id:string) {

        super();
        this.name = name;
        this.id = id;
        this.placedBombs = new Array<number>();

    }

    setGameWorld(world:World) {
        this.gameWorld = world;
    }

    positionPlayers(num:number) {
        
        if(num == 0) {
            this.x = 30;
            this.y = this.gameWorld.centerY()
        }
        else if(num == 1) {
            this.x = this.gameWorld.width - 30;
            this.y = this.gameWorld.centerY();
        }

    }

    setPosition(x:number, y:number, angle?:number) {
        
        this.x = x;
        this.y = y;
        
        if(angle)
        {
            this.angle = angle;
        }
    }

    setAngle(a:number){
        this.angle = a;
    }

    moveUp(speed:number) {
        this.y -= speed;
    }

    moveDown(speed:number) {
        this.y += speed;
    }

    moveRight(speed:number) {
        this.x += speed;
    }

    moveLeft(speed:number) {
        this.x -= speed;
    }

    removeBomb(id:number) {
        this.placedBombs.splice(this.placedBombs.indexOf(id), 1);
    }

    dropBomb(room:Room<GameRoomState>) {
        
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

        setTimeout(this.explodeBomb, this.gameWorld.state.settings.explodeTime, room, id, bombX, bombY);

    }

    explodeBomb(room:Room<GameRoomState>, id:string, bombX:number, bombY:number) {

        room.broadcast("explodeBomb", {bombId:id});
        room.state.gameWorld.gameBall.applyImpulse({x: bombX, y: bombY});

    }

}