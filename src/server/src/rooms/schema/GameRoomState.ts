import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "../../classes/Player"
import { World } from "../../classes/World";

export class GameRoomState extends Schema {

  @type("boolean")
  started:boolean = false;

  @type([Player])
  players = new Array<Player>();

  @type(World)
  gameWorld:World;
}
