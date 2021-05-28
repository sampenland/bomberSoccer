import { Schema, type } from "@colyseus/schema";

export class Player extends Schema {
    
    @type("string")
    name:string;

    @type("string")
    id:string;

    constructor(name:string, id:string) {

        super();
        this.name = name;
        this.id = id;

    }
}