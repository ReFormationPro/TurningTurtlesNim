"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class NimGUI {
    constructor(gameDiv, onPlayerChangedListener = () => { }, onGameOverListener = () => { }) {
        this.game = gameDiv;
        const idx = NimGUI.nims.push(this) - 1;
        this.game.dataset.nimIndex = idx.toString();
        this.onPlayerChangedListener = onPlayerChangedListener;
        this.onGameOverListener = onGameOverListener;
    }
    startGame(nim, vsCPU) {
        this.resetGame(nim);
        this.vsCPU = vsCPU;
    }
    static getNimGUI(nimIndex) {
        return NimGUI.nims[nimIndex];
    }
    static chipOnClick(ev) {
        // Get NimGUI
        const parentPile = this.parentNode;
        const parentGame = parentPile.parentNode;
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
    makeNimChip(color) {
        const chip = document.createElement("div");
        chip.classList.add("chip");
        if (!color) {
            color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        }
        chip.style.backgroundColor = color;
        chip.addEventListener("click", NimGUI.chipOnClick);
        return chip;
    }
    getNimPile(pileNo) {
        return this.game.children[pileNo];
    }
    getPileSizes() {
        const state = [];
        for (let i = 0; i < this.nim; i++) {
            const pile = this.getNimPile(i);
            state.push(pile.children.length);
        }
        return state;
    }
    reduceNimPile(pileNo, newSize) {
        const pile = this.getNimPile(pileNo);
        const exSize = pile.children.length;
        this._reduceNimPile(pileNo, newSize);
        this.onNimPileChanged(pile, exSize, newSize);
    }
    _reduceNimPile(pileNo, newSize) {
        // Remove the chips from pile
        const pile = this.getNimPile(pileNo);
        for (let i = pile.children.length - 1; i >= newSize; i--) {
            pile.removeChild(pile.children[i]);
        }
    }
    removeEvenCountPiles() {
        // No Even Pile Nim:
        // All piles of the same size and even in count are removed
        let sizes = this.getPileSizes();
        const counts = [];
        for (let i = 0; i < sizes.length; i++) {
            counts[sizes[i]] = (counts[sizes[i]] || 0) + 1;
        }
        const removeSizes = [];
        for (let i = 0; i < counts.length; i++) {
            if (counts[i] % 2 == 0) {
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
    changePlayer(newPlayer) {
        if (newPlayer !== undefined && newPlayer !== null) {
            this.player = newPlayer;
        }
        else {
            // Switch players
            if (this.player == 1) {
                this.player = 2;
            }
            else {
                this.player = 1;
            }
        }
        this.onPlayerChanged();
    }
    onPlayerChanged() {
        return __awaiter(this, void 0, void 0, function* () {
            this.onPlayerChangedListener("Player " + this.player);
            if (this.vsCPU && this.player == 2) {
                // Play as CPU
                // Wait a bit
                yield (0, utils_1.sleep)(NimGUI.SLEEP_MS);
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
                }
                else {
                    // No optimal move
                    // Reduce one from any
                    for (let i = 0; i < sizes.length; i++) {
                        if (sizes[i] > 0) {
                            this.reduceNimPile(i, sizes[i] - 1);
                            return;
                        }
                    }
                }
            }
        });
    }
    onNimPileChanged(pile, exSize, newSize) {
        this.removeEvenCountPiles();
        // Check if game over
        const sizes = this.getPileSizes();
        if (!sizes.find((v) => v)) {
            // There is no non-zero nim pile, game over
            this.onGameOverListener("Player " + this.player);
            return;
        }
        // Change player
        this.changePlayer();
    }
    makeNimPile(pileNo, size) {
        const pile = document.createElement("div");
        pile.dataset.pileNo = pileNo.toString();
        pile.classList.add("nimPile");
        for (let i = 0; i < size; i++) {
            const chip = this.makeNimChip();
            pile.appendChild(chip);
        }
        return pile;
    }
    resetGame(nim) {
        this.nim = nim;
        this.player = 1;
        // Clean game
        this.changePlayer(this.player);
        this.game.innerHTML = "";
        const initialPileSizes = [];
        for (let i = 0; i < nim; i++) {
            const size = Math.floor(Math.random() * 10);
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
exports.default = NimGUI;
NimGUI.nims = [];
NimGUI.SLEEP_MS = 3000;
//# sourceMappingURL=NimGUI.js.map