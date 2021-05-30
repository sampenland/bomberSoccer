
export interface IWorld {

    width:number;
    height:number;

}

export interface IPlayer {

    name:string;
    id:string;
    x:number;
    y:number;
    angle:number;
    playerNumber:number;
    gameWorld:IWorld;

}

export interface IGameRoomState {

    players:Array<IPlayer>
    gameWorld:IWorld;

}