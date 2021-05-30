import { Schema, type } from "@colyseus/schema";
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

    @type("number")
    playerNumber:number;

    @type(World)
    gameWorld:World;

    constructor(name:string, id:string, worldR?:World|undefined) {

        super();
        this.name = name;
        this.id = id;
        this.gameWorld = worldR;

    }

    setPlayerNumber(num:number) {
        
        this.playerNumber = num;

        if(this.playerNumber == 1) {
            this.x = this.gameWorld.centerX();
            this.y = this.gameWorld.height - 30;
        }
        else if(this.playerNumber == 2) {
            this.x = this.gameWorld.centerX();
            this.y = 30;
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
}