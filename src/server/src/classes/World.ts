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

    goalLeft:Matter.Body;
    goalRight:Matter.Body;
    leftTop:Matter.Body;
    leftBottom:Matter.Body;
    rightTop:Matter.Body;
    rightBottom:Matter.Body;

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
        this.pWorld.gravity.x = 0;
        this.pWorld.gravity.y = 0;

        this.state = state;

        World.scaleCorrection = 10/24; // server gameball size / client gameball size
        
        Matter.Composite.add(this.pWorld, 
            Matter.Bodies.rectangle(this.width/2, this.borderSize, this.width, this.borderSize, { isStatic: true }) // top
        );
        Matter.Composite.add(this.pWorld, 
            Matter.Bodies.rectangle(this.width/2, this.height - this.borderSize, this.width, this.borderSize, { isStatic: true }) // bottom
        );

        this.createGoals(this.goalSize);

        this.gameBall = new GameBall("gameBall", "gameBall", this, 24 * World.scaleCorrection);
        
        this.gameBall.body = Matter.Bodies.circle(this.width/2, this.height/2, 24 * World.scaleCorrection, {
            mass: this.state.settings.gameBallMass,
            frictionAir: this.state.settings.airFriction,
            restitution: .8,
            label:"gameBall",
        });
        this.gameBall.update();

        Matter.Composite.add(this.pWorld, this.gameBall.body);

        Matter.Runner.run(this.pRunner, this.pEngine);
        Matter.Events.on(this.pRunner, "tick", this.afterUpdate.bind(this, this));

        Matter.Events.on(this.pEngine, "collisionStart", (event) =>{

            const pairs = event.pairs;

            pairs.forEach((collision) => {

                const bodyA = collision.bodyA;
                const bodyB = collision.bodyB;

                if(bodyA.label == "gameBall" && (bodyB.label == "goal-0" || bodyB.label == "goal-1"))
                {
                    if(bodyB.label == "goal-0")
                    {
                        state.players[0].scoreGoal();
                    }
                    else
                    {
                        state.players[1].scoreGoal();
                    }
                }
                else if(bodyB.label == "gameBall" && (bodyA.label == "goal-0" || bodyA.label == "goal-1"))
                {
                    if(bodyA.label == "goal-0")
                    {
                        state.players[0].scoreGoal();
                    }
                    else
                    {
                        state.players[1].scoreGoal();
                    }
                }

            });

        });

    }

    createGoals(goalSize:number) {

        this.goalSize = goalSize;

        // borders
        const goalSep = (this.height - this.goalSize - 2*this.borderSize)/2;

        this.leftTop = Matter.Bodies.rectangle(this.borderSize/2, 
            this.borderSize + goalSep/3, 
            this.borderSize, goalSep, { isStatic: true });

        Matter.Composite.add(this.pWorld, this.leftTop);

        this.leftBottom = Matter.Bodies.rectangle(this.borderSize/2, 
            this.height - this.borderSize - goalSep/3, 
            this.borderSize, 
            goalSep, 
            { isStatic: true });

        Matter.Composite.add(this.pWorld, this.leftBottom);
    
        this.rightTop = Matter.Bodies.rectangle(this.width - this.borderSize/2, 
            this.borderSize + goalSep/3, 
            this.borderSize, goalSep, { isStatic: true });

        Matter.Composite.add(this.pWorld, this.rightTop);

        this.rightBottom = Matter.Bodies.rectangle(this.width - this.borderSize/2, 
            this.height - this.borderSize - goalSep/3, 
            this.borderSize, 
            goalSep, 
            { isStatic: true });

        Matter.Composite.add(this.pWorld, this.rightBottom);

        this.goalLeft = Matter.Bodies.rectangle(-this.borderSize, this.height/2, this.borderSize, this.goalSize, { isStatic: true, label:"goal-0" });
        Matter.Composite.add(this.pWorld, 
             this.goalLeft
        );

        this.goalRight = Matter.Bodies.rectangle(this.width + this.borderSize, this.height/2, this.borderSize, this.goalSize, { isStatic: true, label:"goal-1" });
        Matter.Composite.add(this.pWorld, 
            this.goalRight
        );

    }

    updateGoals(goalSize:number) {
        
        this.goalSize = goalSize;

        Matter.Composite.remove(this.pWorld, this.goalLeft);
        Matter.Composite.remove(this.pWorld, this.goalRight);

        Matter.Composite.remove(this.pWorld, this.leftTop);
        Matter.Composite.remove(this.pWorld, this.leftBottom);
        Matter.Composite.remove(this.pWorld, this.rightTop);
        Matter.Composite.remove(this.pWorld, this.rightBottom);

        const goalSep = (this.height - this.goalSize - 2*this.borderSize)/2;

        this.leftTop = Matter.Bodies.rectangle(this.borderSize/2, 
            this.borderSize + goalSep/3, 
            this.borderSize, goalSep, { isStatic: true });

        Matter.Composite.add(this.pWorld, this.leftTop);

        this.leftBottom = Matter.Bodies.rectangle(this.borderSize/2, 
            this.height - this.borderSize - goalSep/3, 
            this.borderSize, 
            goalSep, 
            { isStatic: true });

        Matter.Composite.add(this.pWorld, this.leftBottom);
    
        this.rightTop = Matter.Bodies.rectangle(this.width - this.borderSize/2, 
            this.borderSize + goalSep/3, 
            this.borderSize, goalSep, { isStatic: true });

        Matter.Composite.add(this.pWorld, this.rightTop);

        this.rightBottom = Matter.Bodies.rectangle(this.width - this.borderSize/2, 
            this.height - this.borderSize - goalSep/3, 
            this.borderSize, 
            goalSep, 
            { isStatic: true });

        Matter.Composite.add(this.pWorld, this.rightBottom);

        this.goalLeft = Matter.Bodies.rectangle(-this.borderSize, this.height/2, this.borderSize, this.goalSize, { isStatic: true, label:"goal-0" });
        Matter.Composite.add(this.pWorld, 
             this.goalLeft
        );

        this.goalRight = Matter.Bodies.rectangle(this.width + this.borderSize, this.height/2, this.borderSize, this.goalSize, { isStatic: true, label:"goal-1" });
        Matter.Composite.add(this.pWorld, 
            this.goalRight
        );
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