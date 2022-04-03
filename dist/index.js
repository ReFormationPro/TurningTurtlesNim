import NimGUI from "./NimGUI";
var info = document.querySelector("#info");
var nimGui = new NimGUI(document.querySelector("#nimGame"), function (player) {
    info.innerText = "Turn: " + player;
}, function (winner) {
    info.innerText = "Winner: " + winner;
});
nimGui.startGame(4, true);
