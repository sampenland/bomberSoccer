import { Schema, type } from "@colyseus/schema";
import { Player } from "../../classes/Player"

export class GameLobbyState extends Schema {

  @type([Player])
  players = new Array<Player>();

}
