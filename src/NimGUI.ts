import {sleep} from "./utils";

export default class NimGUI {
    game!: HTMLElement;
    static nims: NimGUI[] = [];
    nim!: number;
    player!: number;
    onPlayerChangedListener: (player: string) => void;
    onGameOverListener: (winner: string) => void;
    vsCPU!: boolean;
    static SLEEP_MS: number = 3000;

    constructor(gameDiv: HTMLDivElement,
            onPlayerChangedListener: (player: string) => void = ()=>{},
            onGameOverListener: (winner: string) => void = ()=>{}) {
        this.game = gameDiv;
        const idx = NimGUI.nims.push(this)-1;
        this.game.dataset.nimIndex = idx.toString();
        this.onPlayerChangedListener = onPlayerChangedListener;
        this.onGameOverListener = onGameOverListener;
    }
    startGame(nim: number, vsCPU: boolean) {
        this.resetGame(nim);
        this.vsCPU = vsCPU;
    }
    static getNimGUI(nimIndex: number) {
        return NimGUI.nims[nimIndex];
    }
    static chipOnClick(this: HTMLElement, ev: MouseEvent) {
        // Get NimGUI
        const parentPile = this.parentNode as HTMLElement;
        const parentGame = parentPile.parentNode as HTMLElement;
        const nimIndex = Number(parentGame.dataset.nimIndex);
        const nimGUI = NimGUI.getNimGUI(nimIndex);
        // Resolve pile no and chip index
        const pileNo = Number(parentPile.dataset.pileNo);
        const index = Array.prototype.indexOf.call(parentPile.children, this);
        console.log("Pile", pileNo, "has been clicked at index", index);
        // Check if it is our turn
        if (nimGUI.vsCPU && nimGUI.player == 2) {
            // Computer's turn, abort
            return;
        }
        // Tell the game about this
        nimGUI.reduceNimPile(pileNo, index);
    }
    makeNimChip(color?: string | null) {
        const chip = document.createElement("div");
        chip.classList.add("chip");
        if (!color) {
            color = "#"+Math.floor(Math.random()*16777215).toString(16);
        }
        chip.style.backgroundColor = color;
        chip.addEventListener("click", NimGUI.chipOnClick);
        return chip;
    }
    getNimPile(pileNo: number): HTMLElement {
        return this.game.children[pileNo] as HTMLElement;
    }
    getPileSizes(): number[] {
        const state: number[] = [];
        for (let i = 0; i < this.nim; i++) {
            const pile = this.getNimPile(i);
            state.push(pile.children.length);
        }
        return state;
    }
    reduceNimPile(pileNo: number, newSize: number) {
        const pile = this.getNimPile(pileNo);
        const exSize = pile.children.length;
        this._reduceNimPile(pileNo, newSize);
        this.onNimPileChanged(pile, exSize, newSize);
    }
    _reduceNimPile(pileNo: number, newSize: number) {
        // Remove the chips from pile
        const pile = this.getNimPile(pileNo);
        for (let i = pile.children.length-1; i >= newSize; i--) {
            pile.removeChild(pile.children[i]);
        }
    }
    removeEvenCountPiles() {
        // No Even Pile Nim:
        // All piles of the same size and even in count are removed
        let sizes = this.getPileSizes();
        const counts: number[] = [];
        for (let i = 0; i < sizes.length; i++) {
            counts[sizes[i]] = (counts[sizes[i]] || 0) + 1;
        }
        const removeSizes: number[] = []
        for (let i = 0; i < counts.length; i++) {
            if (counts[i]%2 == 0) {
                removeSizes.push(i);
            }
        }
        for (let i = 0; i < sizes.length; i++) {
            if (removeSizes.includes(sizes[i])) {
                // Remove this pile
                this._reduceNimPile(i, 0);
            }
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
    async onPlayerChanged() {
        this.onPlayerChangedListener("Player "+this.player);
        if (this.vsCPU && this.player == 2) {
            // Play as CPU
            // Wait a bit
            await sleep(NimGUI.SLEEP_MS);
            const sizes = this.getPileSizes();
            var nimSum = 0;
            for (let i = 0; i < sizes.length; i++) {
                nimSum ^= sizes[i];
            }
            if (nimSum != 0) {
                // There is an optimal move
                // Find left most 1 bit index
                let idx = 1;
                while (true) {
                    if (nimSum >> idx == 0) {
                        idx -= 1;
                        break;
                    }
                    idx++;
                }
                const threshold = 1 << idx;
                // Reduce the first pile we found optimal move
                for (let i = 0; i < sizes.length; i++) {
                    if (sizes[i] >= threshold) {
                        const newSize = sizes[i] ^ nimSum;
                        this.reduceNimPile(i, newSize);
                        return;
                    }
                }

            } else {
                // No optimal move
                // Reduce one from any
                for (let i = 0; i < sizes.length; i++) {
                    if (sizes[i] > 0) {
                        this.reduceNimPile(i, sizes[i]-1);
                        return;
                    }
                }
            }
        }
    }
    onNimPileChanged(pile: HTMLElement, exSize: number, newSize: number) {
        this.removeEvenCountPiles();
        // Check if game over
        const sizes = this.getPileSizes();
        if (!sizes.find((v) => v)) {
            // There is no non-zero nim pile, game over
            this.onGameOverListener("Player "+this.player);
            return;
        }
        // Change player
        this.changePlayer();
    }
    makeNimPile(pileNo: number, size: number) {
        const pile = document.createElement("div");
        pile.dataset.pileNo = pileNo.toString();
        pile.classList.add("nimPile");
        for (let i = 0; i < size; i++) {
            const chip = this.makeNimChip();
            pile.appendChild(chip);
        }
        return pile;
    }
    resetGame(nim: number) {
        this.nim = nim;
        this.player = 1;
        // Clean game
        this.changePlayer(this.player);
        this.game.innerHTML = "";
        const initialPileSizes: number[] = [];
        for (let i = 0; i < nim; i++) {
            const size = Math.floor(Math.random()*10);
            initialPileSizes.push(size);
        }
        // Create piles
        for (let i = 0; i < nim; i++) {
            // Create pile
            const pile = this.makeNimPile(i, initialPileSizes[i]);
            // Put pile
            this.game.appendChild(pile);
        }
        this.removeEvenCountPiles();
    }
}