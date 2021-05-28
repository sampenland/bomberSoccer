import { Schema, type } from "@colyseus/schema";

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

    constructor(name:string, id:string) {

        super();
        this.name = name;
        this.id = id;

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