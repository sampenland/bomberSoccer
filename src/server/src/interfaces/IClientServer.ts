export interface IGameSettings {
    gameSize:{width:number, height:number};
    borderSize:number;
    goalSize:number;
}

export interface IBomb {
    x:number;
    y:number;
}