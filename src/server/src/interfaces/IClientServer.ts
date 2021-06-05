export interface IGameSettings {
    gameSize:{width:number, height:number};
    borderSize:number;
    goalSize:number;
    testGame:boolean;
}

export interface IBomb {
    x:number;
    y:number;
}

export interface IPhysicsSettings {

    blastRadiusMax:number;
    blastMagnitude:number;
    explodeTime:number;
    maxSpeed:number;
    gameBallMass:number;

}