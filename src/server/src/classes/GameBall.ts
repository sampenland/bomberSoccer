import { Schema, type } from "@colyseus/schema";
import Matter from "matter-js";
import { IBomb } from "../interfaces/IClientServer";
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

    constructor(name:string, id:string, worldR?:World|undefined) {

        super();
        this.name = name;
        this.id = id;
        this.gameWorld = worldR;

        console.log("created gameball");

    }

    update() {

        this.x = this.body.position.x;
        this.y = this.body.position.y;
        console.log(this.x, this.y);
    
    }

    applyImpulse(bomb:IBomb){
        // apply impulse
    }

}