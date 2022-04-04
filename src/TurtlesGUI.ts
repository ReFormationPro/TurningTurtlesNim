import NimGUI from "./NimGUI";

export default class TurtlesGUISlave {
    turtles: number;
    game: HTMLElement;
    static games: TurtlesGUISlave[] = [];
    nimGame: NimGUI;

    constructor(game: HTMLElement, nimGame: NimGUI, turtles: number) {
        this.turtles = turtles;
        this.game = game;
        this.nimGame = nimGame;
        const idx = TurtlesGUISlave.games.push(this)-1;
        this.game.dataset.gameIndex = idx.toString();
    }
    static getTurtlesGUISlave(gameIndex: number) {
        return TurtlesGUISlave.games[gameIndex];
    }
    makeGame(nimPileSizes: number[], turtles: number = 10) {
        this.turtles = turtles;
        // Clean game
        this.game.innerHTML = "";
        for (let i = 0; i < turtles; i++) {
            const turtle = this.makeTurtle("T");
            this.game.appendChild(turtle);
        }
        // Set state
        for (let i = 0; i < nimPileSizes.length; i++) {
            if (nimPileSizes[i] == 0) continue;
            TurtlesGUISlave.switchTurtle(
                this.game.children[nimPileSizes[i]-1] as HTMLElement);
        }
    }
    static switchTurtle(turtle: HTMLElement) {
        if (turtle.innerText == "H") {
            turtle.innerText = "T";
        } else {
            turtle.innerText = "H";
        }
    }
    static turtleOnClick(this: HTMLElement, ev: MouseEvent) {
        return;
        // Get TurtlesGUISlave
        const gameDiv = this.parentNode as HTMLElement;
        const turtlesGameIndex = Number(gameDiv.dataset.nimIndex);
        const turtlesGUISlave = TurtlesGUISlave.getTurtlesGUISlave(turtlesGameIndex);
        // Check if it is our turn
        if (turtlesGUISlave.nimGame.vsCPU && 
            turtlesGUISlave.nimGame.player == 2) {
            // Computer's turn, abort
            return;
        }
        // Resolve pile no and chip index
        const turtleNo = Array.prototype.indexOf.call(gameDiv.children, this);
        console.log("Turtle clicked", turtleNo);
        // Change text
        TurtlesGUISlave.switchTurtle(this);
        // Tell the game about this
        // TODO
    }
    /**
     * 
     * @param state "H" or "T"
     * @returns 
     */
    makeTurtle(state: string) {
        if (state != "H" && state != "T") {
            console.error("Invalid turtle state:", state);
        }
        const turtle = document.createElement("div");
        turtle.classList.add("turtle");
        turtle.addEventListener("click", TurtlesGUISlave.turtleOnClick);
        turtle.innerText = state;
        return turtle;
    }
}

export class TurtlesGUI {
    turtles: number;
    game: HTMLElement;
    player: number;
    vsCPU: boolean;
    static games: TurtlesGUI[] = [];

    constructor(game: HTMLElement, turtles: number) {
        this.turtles = turtles;
        this.game = game;
        this.player = 1;
        const idx = TurtlesGUI.games.push(this)-1;
        this.game.dataset.gameIndex = idx.toString();
    }
    static getTurtlesGUI(gameIndex: number) {
        return TurtlesGUI.games[gameIndex];
    }
    resetGame(turtles: number) {
        this.turtles = turtles;
        this.player = 1;
        // Clean game
        this.changePlayer(this.player);
        this.game.innerHTML = "";
        for (let i = 0; i < turtles; i++) {
            // TODO State
            const turtle = this.makeTurtle("H");
            this.game.appendChild(turtle);
        }
    }
    changePlayer(newPlayer: number | void) {
        if (!isNaN(newPlayer as number)) {
            this.player = newPlayer as number;
        } else {
            // Switch players
            if (this.player == 1) {
                this.player = 2;
            } else {
                this.player = 1;
            }
        }
        this.onPlayerChanged();
    }
    onPlayerChanged() {
        throw new Error("Method not implemented.");
    }
    static switchTurtle(turtle: HTMLElement) {
        if (turtle.innerText == "H") {
            turtle.innerText = "T";
        } else {
            turtle.innerText = "H";
        }
    }
    static turtleOnClick(this: HTMLElement, ev: MouseEvent) {
        // Get TurtlesGUI
        const gameDiv = this.parentNode as HTMLElement;
        const turtlesGameIndex = Number(gameDiv.dataset.nimIndex);
        const turtlesGUI = TurtlesGUI.getTurtlesGUI(turtlesGameIndex);
        // Check if it is our turn
        if (turtlesGUI.vsCPU && turtlesGUI.player == 2) {
            // Computer's turn, abort
            return;
        }
        // Resolve pile no and chip index
        const turtleNo = Array.prototype.indexOf.call(gameDiv.children, this);
        console.log("Turtle clicked", turtleNo);
        // Change text
        TurtlesGUI.switchTurtle(this);
        // Tell the game about this
        // TODO
    }
    /**
     * 
     * @param state "H" or "T"
     * @returns 
     */
    makeTurtle(state: string) {
        if (state != "H" && state != "T") {
            console.error("Invalid turtle state:", state);
        }
        const turtle = document.createElement("div");
        turtle.classList.add("turtle");
        turtle.addEventListener("click", TurtlesGUI.turtleOnClick);
        turtle.innerText = state;
        return turtle;
    }
}