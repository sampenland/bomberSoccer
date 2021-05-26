import { Schema, MapSchema, type } from "@colyseus/schema";
import { Player } from "../../classes/Player"

export class MainLobbyState extends Schema {

  @type({map:Player})
  players = new MapSchema<Player>();

  @type(Player)
  playerOne:Player;

  @type(Player)
  playerTwo:Player;

}
