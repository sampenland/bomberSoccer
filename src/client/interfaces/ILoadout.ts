import { HeroType } from "../globals/GameManager";

export interface ILoadout {

    coins:number;
    usedCoins:number;
    hero:string;
    bombs:number;
    specialBombs:number;

    ready:boolean;

}