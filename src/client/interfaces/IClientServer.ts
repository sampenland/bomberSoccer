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
    maxSpeed:number;
    gameBallMass:number;
    moveDelay:number;
    solidPlayers:number;
}

export interface IGameBall {
    name:string;
    id:string;
    x:number;
    y:number;
    gameWorld:IWorld;
}

export interface IBombDrop {
    bombId:number;
    player:IPlayer;
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

}

export interface IGameRoomState {

    players:Array<IPlayer>
    gameWorld:IWorld;

}