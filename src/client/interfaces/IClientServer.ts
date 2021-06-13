export interface IRect {
    x:number, 
    y:number, 
    width:number, 
    height:number
}

export interface ICircle {
    x:number;
    y:number;
    radius:number;
}

export interface IControls {
    tryDropBomb:boolean;
    mouseX:number;
    mouseY:number;
    leftPressed:number;
    rightPressed:number;
}

export interface IGameSettings {
    gameSize:{width:number, height:number};
    borderSize:number;
    goalSize:number;
    testGame:boolean;
    bombsAvailable:number;
}

export interface IAdjustableSettings {

    blastRadiusMax:number;
    blastMagnitude:number;
    explodeTime:number;
    gameBallMass:number;
    moveDelay:number;
    solidPlayers:number;
    goalSize:number;
    airFriction:number;
}

export interface IGameBall {
    name:string;
    id:string;
    x:number;
    y:number;
    gameWorld:IWorld;
    radius:number;
    velocityX:number;
    velocityY:number;
}

export interface IBombDrop {
    bombId:number;
    player:IPlayer;
    explodeDelay:number;
}

export interface IWorld {

    width:number;
    height:number;
    gameBall:IGameBall;

}

export interface IPlayer {

    name:string;
    id:string;
    x:number;
    y:number;
    angle:number;
    playerNumber:number;
    gameWorld:IWorld;
    score:number;
    radius:number;
    bombsAvailable:number;

}

export interface IGameRoomState {

    players:Array<IPlayer>
    gameWorld:IWorld;

}