import { HeroType } from "../globals/GameManager";

export interface ILoadout {

    coins:number;
    usedCoins:number;
    hero:{name:string, val:number};
    bombs:number;
    specialBombs:number;

    ready:boolean;

}