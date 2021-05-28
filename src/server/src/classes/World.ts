import { Schema, type } from "@colyseus/schema";

export class World extends Schema {
    
    @type("number")
    width:number;

    @type("number")
    height:number;

    constructor() {

        super();
        this.width = 0;
        this.height = 0;

    }

    setSize(width:number, height:number) {

        this.width = width;
        this.height = height;

    }
}