export interface IControls {
    mouseX:number;
    mouseY:number;
    leftPressed:boolean;
    rightPressed:boolean;
    middlePressed:boolean;
}

export interface ILoadout {

    loadout:{
        coins:number;
        usedCoins:number;
        hero:{name:string, val:number};
        bombs:number;
        specialBombs:number;

        ready:boolean;
    }

}

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

export interface IReady {
    ready:boolean;
}

export interface IAdjustableSettings {

    blastRadiusMax:number;
    blastMagnitude:number;
    explodeTime:number;
    gameBallMass:number;
    bombsAvailable:number;
    instantBombReset:number;
    moveDelay:number;
    solidPlayers:number;
    goalSize:number;
    airFriction:number;

}