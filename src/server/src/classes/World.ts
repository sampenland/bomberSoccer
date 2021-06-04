import { Schema, type } from "@colyseus/schema";
import Matter from 'matter-js'
import { GameBall } from "./GameBall";

export class World extends Schema {
    
    @type("number")
    width:number;

    @type("number")
    height:number;

    borderSize:number;
    goalSize:number;

    pEngine:Matter.Engine;
    pWorld:Matter.World;
    pRunner:Matter.Runner;

    @type(GameBall)
    gameBall:GameBall;

    constructor(width:number, height:number, borderSize:number, goalSize:number) {

        super();
        this.width = width;
        this.height = height;
        this.borderSize = borderSize;
        this.goalSize = goalSize;

        this.pEngine = Matter.Engine.create();
        this.pWorld = this.pEngine.world;

        this.pRunner = Matter.Runner.create();
        Matter.Runner.run(this.pRunner, this.pEngine);

        // borders
        Matter.Composite.add(this.pWorld, 
            Matter.Bodies.rectangle(0, 0, this.width, this.borderSize, { isStatic: true }) // top
        );
        Matter.Composite.add(this.pWorld, 
            Matter.Bodies.rectangle(0, this.height - this.borderSize, this.width, this.height, { isStatic: true }) // bottom
        );
        Matter.Composite.add(this.pWorld, 
            Matter.Bodies.rectangle(0, 0, this.borderSize, this.height, { isStatic: true }) // left
        );
        Matter.Composite.add(this.pWorld, 
            Matter.Bodies.rectangle(this.width - this.borderSize, 0, this.width, this.height, { isStatic: true }) // right
        );

        this.gameBall = new GameBall("gameBall", "gameBall", this);
        this.gameBall.body = Matter.Bodies.circle(this.width/2, this.height/2, 10, {
            density: 0.01,
            velocity: {x:100, y:100}
        });

    }

    centerX(){
        return this.width/2;
    }

    centerY(){
        return this.height/2;
    }
}