import { Schema, type } from "@colyseus/schema";
import Matter from 'matter-js'
import { GameRoomState } from "../rooms/schema/GameRoomState";
import { GameBall } from "./GameBall";

export class World extends Schema {
    
    @type("number")
    width:number;

    @type("number")
    height:number;

    borderSize:number;
    goalSize:number;

    disposed:boolean = false;
    static scaleCorrection:number;

    pEngine:Matter.Engine;
    pWorld:Matter.World;
    pRunner:Matter.Runner;

    @type(GameBall)
    gameBall:GameBall;
    state:GameRoomState;

    constructor(width:number, height:number, borderSize:number, goalSize:number, state:GameRoomState) {

        super();

        console.log("Created matter js world");
        this.width = width;
        this.height = height;
        this.borderSize = borderSize;
        this.goalSize = goalSize;

        this.pEngine = Matter.Engine.create();
        this.pRunner = Matter.Runner.create();
        this.pWorld = this.pEngine.world;
        this.pWorld.gravity.x = -.05;
        this.pWorld.gravity.y = 0;

        this.state = state;

        World.scaleCorrection = 10/24; // server gameball size / client gameball size
        
        // borders
        Matter.Composite.add(this.pWorld, 
            Matter.Bodies.rectangle(this.width/2, this.borderSize, this.width, this.borderSize, { isStatic: true }) // top
        );
        Matter.Composite.add(this.pWorld, 
            Matter.Bodies.rectangle(this.width/2, this.height - this.borderSize, this.width, this.borderSize, { isStatic: true }) // bottom
        );
        Matter.Composite.add(this.pWorld, 
            Matter.Bodies.rectangle(0, this.height/2, this.borderSize, this.height, { isStatic: true }) // left
        );
        Matter.Composite.add(this.pWorld, 
            Matter.Bodies.rectangle(this.width - this.borderSize, this.height/2, this.borderSize, this.height, { isStatic: true }) // right
        );

        this.gameBall = new GameBall("gameBall", "gameBall", this);
        
        this.gameBall.body = Matter.Bodies.circle(this.width/2, this.height/2, 24 * World.scaleCorrection, {
            mass: this.state.settings.gameBallMass,
            frictionAir: 0,
            restitution: .8,
        });
        this.gameBall.update();

        Matter.Composite.add(this.pWorld, this.gameBall.body);

        Matter.Runner.run(this.pRunner, this.pEngine);
        Matter.Events.on(this.pRunner, "tick", this.afterUpdate.bind(this, this));

    }

    afterUpdate(world:this) {

        if(this.disposed) {
            this.dispose();
            return;
        }

        world.gameBall.update();

    }

    centerX(){
        return this.width/2;
    }

    centerY(){
        return this.height/2;
    }

    dispose() {
                
        Matter.Events.off(this.pRunner, "tick", undefined);
        Matter.World.clear(this.pWorld, false);
        Matter.Engine.clear(this.pEngine);
        Matter.Runner.stop(this.pRunner);

        this.disposed = true;
    }
}