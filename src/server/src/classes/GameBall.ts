import { Schema, type } from "@colyseus/schema";
import Matter from "matter-js";
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
    body:Matter.Bodies;

    constructor(name:string, id:string, worldR?:World|undefined) {

        super();
        this.name = name;
        this.id = id;
        this.gameWorld = worldR;

    }

}