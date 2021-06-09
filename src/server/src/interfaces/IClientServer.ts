export interface IControls {
    mouseX:number;
    mouseY:number;
    leftPressed:boolean;
    rightPressed:boolean;
    middlePressed:boolean;
}

export interface IGameSettings {
    gameSize:{width:number, height:number};
    borderSize:number;
    goalSize:number;
    testGame:boolean;
    bombsAvailable:number;
}

export interface IBomb {
    x:number;
    y:number;
}

export interface IAdjustableSettings {

    blastRadiusMax:number;
    blastMagnitude:number;
    explodeTime:number;
    maxSpeed:number;
    gameBallMass:number;
    bombsAvailable:number;
    instantBombReset:number;
    moveDelay:number;
    solidPlayers:number;

}