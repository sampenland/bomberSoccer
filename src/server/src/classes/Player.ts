import { Schema, type } from "@colyseus/schema";
import { Room } from "colyseus";
import Matter from "matter-js";
import { GameRoomState } from "../rooms/schema/GameRoomState";
import { World } from "./World";

export class SpecialType {

    static count = 2;
    static instant = {name: "Instanta", val: 1};
    static inverter = {name: "Inverter", val: 2};

    static getSpecialType(val:number) {
        if(val == 1) return SpecialType.instant;
        if(val == 2) return SpecialType.inverter;
        return SpecialType.instant;
    }

}

export class Player extends Schema {
    
    @type("string")
    name:string;

    @type("string")
    id:string;

    @type("number")
    playerNumber:number = -1;

    @type("number")
    x:number;

    @type("number")
    y:number;

    @type("boolean")
    ready:boolean;

    @type(World)
    gameWorld:World;

    @type("number")
    bombsAvailable:number;

    @type("number")
    special:number;

    @type("number")
    score:number = 0;

    @type("number")
    totalCoins:number = 1;
    @type("number")
    usedCoins:number = 0;

    @type("number")
    instantBombsAvailable:number = 1;
    canDropSpecial:boolean = true;

    body:Matter.Body;
    @type("number")
    radius:number;

    placedBombs:Array<number>;

    constructor(name:string, id:string) {

        super();
        this.name = name;
        this.id = id;
        this.ready = false;
        this.placedBombs = new Array<number>();

    }

    tryBuyBomb() {

        if(this.usedCoins < this.totalCoins) {
            this.usedCoins++;
            this.bombsAvailable++;
            return true;
        }

        return false;

    }

    trySellBomb() {

        if(this.usedCoins > 0) {
            this.usedCoins--;
            this.bombsAvailable--;
            return true;
        }

        return false;

    }

    setGameWorld(world:World, bombsAvailable:number, playerColliderRadius:number) {
        this.gameWorld = world;
        this.bombsAvailable = bombsAvailable;
        this.body = Matter.Bodies.circle(40, 90, playerColliderRadius * World.scaleCorrection, {isStatic: true});
        this.radius = 26 * World.scaleCorrection;
        Matter.Composite.add(this.gameWorld.pWorld, this.body);
        this.changeSolid(this.gameWorld.state.settings.solidPlayers == 1);
    }

    changeSolid(isSolid:boolean) {
        this.body.isSensor = !isSolid;
    }

    positionPlayers(num:number) {
        
        this.playerNumber = num;
        
        if(num == 0) {
            this.x = 40;
            this.y = this.gameWorld.centerY()
        }
        else if(num == 1) {
            this.x = this.gameWorld.width - 40;
            this.y = this.gameWorld.centerY();
        }

        Matter.Body.setPosition(this.body, {x:this.x, y:this.y});

    }

    reset() {
        this.positionPlayers(this.playerNumber);
    }

    scoreGoal() {
        this.gameWorld.room.broadcast("score", {});
        this.gameWorld.reset();
        this.score++;
    }

    clearBombs() {

        this.placedBombs = new Array<number>();

    }

    setPosition(x:number, y:number) {
        
        this.x = x;
        this.y = y;
        Matter.Body.setPosition(this.body, {x:this.x, y:this.y});
    }

    removeBomb(id:number) {
        this.placedBombs.splice(this.placedBombs.indexOf(id), 1);
    }

    dropBomb(isSpecial:boolean) {
        
        const instant = SpecialType.getSpecialType(this.special) == SpecialType.instant;
        const inverter = SpecialType.getSpecialType(this.special) == SpecialType.inverter;

        if(isSpecial) {

            // instant bomb            
            if(instant && this.canDropSpecial) 
            {
                this.canDropSpecial = false;
                setTimeout(() => {
                    this.canDropSpecial = true;
                }, this.gameWorld.state.settings.specialBombReset);
            }
            else if(instant && !this.canDropSpecial)
            {
                return;
            }

            // inverter
            if(inverter && this.canDropSpecial) 
            {
                this.canDropSpecial = false;
                setTimeout(() => {
                    this.canDropSpecial = true;
                }, this.gameWorld.state.settings.specialBombReset);
            }
            else if(inverter && !this.canDropSpecial)
            {
                return;
            }

        }

        if(this.bombsAvailable != -1)
        {
            if(this.bombsAvailable < 1) {
                return;
            }
            else
            {
                this.bombsAvailable--;
            }
        }

        let hasId = false;
        let id = -1;
        let cnt = 0;
        while(hasId == false){
            if(!this.placedBombs.includes(cnt)){
                id = cnt;
                hasId = true;
                break;
            }
            cnt++;
        }

        if(id == -1) return;

        this.placedBombs.push(id);
        let bombX = this.x;
        let bombY = this.y;

        let explodeTime = this.gameWorld.state.settings.explodeTime;
        if(isSpecial && instant) explodeTime = 10;

        this.gameWorld.room.broadcast("bombDrop", {
            player:this,
            bombId: id,
            explodeDelay: explodeTime,
            isSpecial: isSpecial,
            special:this.special
        });

        setTimeout(this.explodeBomb, explodeTime, this.gameWorld.room, id, bombX, bombY, isSpecial, this.special, this);

    }

    explodeBomb(room:Room<GameRoomState>, id:string, bombX:number, bombY:number, isSpecial:boolean, special:number, player:this) {

        if(player.placedBombs.length == 0) return;

        let scaleConstant = 16;
        room.broadcast("explodeBomb", {
            bombId:id, 
            explodeScale:room.state.settings.blastRadiusMax/scaleConstant,
        });

        room.state.gameWorld.gameBall.applyImpulse({x: bombX, y: bombY}, (isSpecial && SpecialType.getSpecialType(special) == SpecialType.inverter));

    }

}