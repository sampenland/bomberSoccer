import { Schema, type } from "@colyseus/schema";
import Matter from "matter-js";
import { IBomb } from "../interfaces/IClientServer";
import { GameRoomState } from "../rooms/schema/GameRoomState";
import Common from "./Common";
import { World } from "./World";

export class GameBall extends Schema {

    @type("string")
    name:string;

    @type("string")
    id:string;

    @type("number")
    x:number;

    @type("number")
    y:number;

    gameWorld:World;
    body:Matter.Body;

    constructor(name:string, id:string, worldR:World) {

        super();
        this.name = name;
        this.id = id;
        this.gameWorld = worldR;

        console.log("created gameball");

    }

    update() {

        this.x = this.body.position.x;
        this.y = this.body.position.y;
    
    }

    applyImpulse(bomb:IBomb){
        
        let dir:{x:number, y:number} = {x: 0, y: 0};

        dir.x = this.x - bomb.x;
        dir.y = this.y - bomb.y;

        let distance = Math.sqrt(Math.pow((this.x - bomb.x),2) + Math.pow((this.y - bomb.y), 2));
        if(distance >= this.gameWorld.state.settings.blastRadiusMax) return;
        
        dir.x = (1/dir.x) * this.gameWorld.state.settings.blastMagnitude;
        dir.y = (1/dir.y) * this.gameWorld.state.settings.blastMagnitude;

        dir.x = Common.clamp(dir.x, -this.gameWorld.state.settings.maxSpeed, this.gameWorld.state.settings.maxSpeed);
        dir.y = Common.clamp(dir.y, -this.gameWorld.state.settings.maxSpeed, this.gameWorld.state.settings.maxSpeed);

        Matter.Body.setVelocity(this.body, { x: dir.x, y: dir.y });

    }

}