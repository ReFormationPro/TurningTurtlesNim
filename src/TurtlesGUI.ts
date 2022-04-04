import NimGUI from "./NimGUI";

export default class TurtlesGUISlave {
    turtles: number;
    game: HTMLElement;
    static games: TurtlesGUISlave[] = [];
    nimGame: NimGUI;
    firstTurtle: number;
    secondTurtle: number;

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
    getTurtle(turtleNo: number): HTMLElement {
        return this.game.children[turtleNo-1] as HTMLElement;
    }
    getTurtleState(turtleNo: number): string {
        return this.getTurtle(turtleNo).innerText;
    }
    switchTurtleHighlight(turtleNo: number) {
        if (turtleNo == null) {
            return;
        }
        const turtle = this.getTurtle(turtleNo);
        if (turtle.style.backgroundColor == "green") {
            turtle.style.backgroundColor = "";
        } else {
            turtle.style.backgroundColor = "green";
        }
    }
    /**
     * Play the equivalent move of the selected turtles in nim
     */
    submit() {
        if (this.firstTurtle == null) {
            console.error("No turtle is selected. Cannot submit.");
            return;
        }
        const pileSizes = this.nimGame.getPileSizes();
        const pileIdx = pileSizes.indexOf(this.firstTurtle);
        const newSize = this.secondTurtle != null ? this.secondTurtle : 0; 
        this.nimGame.reduceNimPile(pileIdx, newSize);
        // Clean turtles
        //this.switchTurtleHighlight(this.firstTurtle);
        //this.switchTurtleHighlight(this.secondTurtle);
        this.firstTurtle = this.secondTurtle = null;
    }
    /**
     * 
     * @param turtleNo 1-indexed turtle no
     */
    onTurtleClicked(turtleNo: number) {
        if (this.secondTurtle != null && this.firstTurtle == turtleNo) {
            console.error("To deselect first turtle, deselect second turtle first.");
            return;
        }
        if (this.secondTurtle == turtleNo) {
            // Deselect turtle
            this.switchTurtleHighlight(this.secondTurtle);
            this.secondTurtle = null;
            return;
        }
        if (this.firstTurtle == turtleNo) {
            // Deselect turtle
            this.switchTurtleHighlight(this.firstTurtle);
            this.firstTurtle = null;
            return;
        }
        // Select new turtle
        if (this.firstTurtle != null && turtleNo > this.firstTurtle) {
            console.error("Second turtle has to have a lower number!");
            return;
        }
        if (this.firstTurtle == null &&
            this.getTurtleState(turtleNo) == "H") {
            // Select first turtle
            this.firstTurtle = turtleNo;
            this.switchTurtleHighlight(this.firstTurtle);
            return;
        }
        if (this.firstTurtle != null && this.secondTurtle == null) {
            // Select second turtle
            this.secondTurtle = turtleNo;
            this.switchTurtleHighlight(this.secondTurtle);
            return;
        }
    }
    static turtleOnClick(this: HTMLElement, ev: MouseEvent) {
        // Get TurtlesGUISlave
        const gameDiv = this.parentNode as HTMLElement;
        const turtlesGameIndex = Number(gameDiv.dataset.gameIndex);
        const turtlesGUISlave = TurtlesGUISlave.getTurtlesGUISlave(turtlesGameIndex);
        const turtleNo = 1+Array.prototype.indexOf.call(gameDiv.children, this);
        console.log("Turtle clicked", turtleNo);
        turtlesGUISlave.onTurtleClicked(turtleNo);
        return;
        // Check if it is our turn
        if (turtlesGUISlave.nimGame.vsCPU && 
            turtlesGUISlave.nimGame.player == 2) {
            // Computer's turn, abort
            return;
        }
        // Resolve pile no and chip index
        //const turtleNo = Array.prototype.indexOf.call(gameDiv.children, this);
        //console.log("Turtle clicked", turtleNo);
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