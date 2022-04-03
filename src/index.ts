import NimGUI from "./NimGUI";

const info = document.querySelector("#info") as HTMLDivElement;

const nimGui = new NimGUI(
    (document.querySelector("#nimGame") as HTMLDivElement),
    (player: string) => {
        info.innerText = "Turn: " + player;
    },
    (winner: string) => {
        info.innerText = "Winner: " + winner;
    });
nimGui.startGame(4, true);