import NimGUI from "./NimGUI";
import TurtlesGUISlave from "./TurtlesGUI";

const info = (document.querySelector("#info") as HTMLDivElement);

const nimGui = new NimGUI(
    (document.querySelector("#nimGame") as HTMLDivElement),
    (player: string) => {
        info.innerText = "Turn: " + player;
        tgame.makeGame(nimGui.getPileSizes(), 10);
    },
    (winner: string) => {
        info.innerText = "Winner: " + winner;
        tgame.makeGame(nimGui.getPileSizes(), 10);
    });
nimGui.startGame(4, true);

const tgame = new TurtlesGUISlave(
    (document.querySelector("#turtleGame") as HTMLDivElement),
    10
);
tgame.makeGame(nimGui.getPileSizes(), 10);