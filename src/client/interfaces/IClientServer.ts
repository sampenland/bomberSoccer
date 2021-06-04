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

}

export interface IGameRoomState {

    players:Array<IPlayer>
    gameWorld:IWorld;

}