import NimGUI from "./NimGUI";
import TurtlesGUISlave from "./TurtlesGUI";

const info = (document.querySelector("#info") as HTMLDivElement);

const nimGui = new NimGUI(
    (document.querySelector("#nimGame") as HTMLDivElement),
    onPlayerChanged,
    onGameOver);
nimGui.startGame(4, true);

const tgame = new TurtlesGUISlave(
    (document.querySelector("#turtleGame") as HTMLDivElement),
    nimGui,
    10
);
tgame.makeGame(nimGui.getPileSizes(), 10);

const turtleSubmit = document.querySelector("#turtleSubmit");
turtleSubmit.addEventListener("click", tgame.submit.bind(tgame));

function onPlayerChanged(player: string) {
    info.innerText = "Turn: " + player;
    tgame.makeGame(nimGui.getPileSizes(), 10);
}
function onGameOver(winner: string) {
    info.innerText = "Winner: " + winner;
    tgame.makeGame(nimGui.getPileSizes(), 10);
}