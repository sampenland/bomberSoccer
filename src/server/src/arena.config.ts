import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import { Server, RedisPresence } from "colyseus";

/**
 * Import your Room files
 */
import { MainLobby } from "./rooms/MainLobby";
import { GameLobby } from "./rooms/GameLobby";
import { GameRoom } from "./rooms/GameRoom";

export default Arena({
    getId: () => "Bomber Soccer",

    initializeGameServer: (gameServer:Server) => {
        
        /**
         * Define your room handlers:
         */
        gameServer.define('mainLobby', MainLobby);
        gameServer.define('gameLobby', GameLobby);
        gameServer.define('gameRoom', GameRoom);
        
    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("Booted Bomber Soccer server!");
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});