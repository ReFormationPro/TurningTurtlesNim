var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { isNumberObject } from "util/types";
import { sleep } from "./utils";
var NimGUI = /** @class */ (function () {
    function NimGUI(gameDiv, onPlayerChangedListener, onGameOverListener) {
        if (onPlayerChangedListener === void 0) { onPlayerChangedListener = function () { }; }
        if (onGameOverListener === void 0) { onGameOverListener = function () { }; }
        this.game = gameDiv;
        var idx = NimGUI.nims.push(this) - 1;
        this.game.dataset.nimIndex = idx.toString();
        this.onPlayerChangedListener = onPlayerChangedListener;
        this.onGameOverListener = onGameOverListener;
    }
    NimGUI.prototype.startGame = function (nim, vsCPU) {
        this.resetGame(nim);
        this.vsCPU = vsCPU;
    };
    NimGUI.getNimGUI = function (nimIndex) {
        return NimGUI.nims[nimIndex];
    };
    NimGUI.chipOnClick = function (ev) {
        // Get NimGUI
        var parentPile = this.parentNode;
        var parentGame = parentPile.parentNode;
        var nimIndex = Number(parentGame.dataset.nimIndex);
        var nimGUI = NimGUI.getNimGUI(nimIndex);
        // Resolve pile no and chip index
        var pileNo = Number(parentPile.dataset.pileNo);
        var index = Array.prototype.indexOf.call(parentPile.children, this);
        console.log("Pile", pileNo, "has been clicked at index", index);
        // Check if it is our turn
        if (nimGUI.vsCPU && nimGUI.player == 2) {
            // Computer's turn, abort
            return;
        }
        // Tell the game about this
        nimGUI.reduceNimPile(pileNo, index);
    };
    NimGUI.prototype.makeNimChip = function (color) {
        var chip = document.createElement("div");
        chip.classList.add("chip");
        if (!color) {
            color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        }
        chip.style.backgroundColor = color;
        chip.addEventListener("click", NimGUI.chipOnClick);
        return chip;
    };
    NimGUI.prototype.getNimPile = function (pileNo) {
        return this.game.children[pileNo];
    };
    NimGUI.prototype.getPileSizes = function () {
        var state = [];
        for (var i = 0; i < this.nim; i++) {
            var pile = this.getNimPile(i);
            state.push(pile.children.length);
        }
        return state;
    };
    NimGUI.prototype.reduceNimPile = function (pileNo, newSize) {
        var pile = this.getNimPile(pileNo);
        var exSize = pile.children.length;
        this._reduceNimPile(pileNo, newSize);
        this.onNimPileChanged(pile, exSize, newSize);
    };
    NimGUI.prototype._reduceNimPile = function (pileNo, newSize) {
        // Remove the chips from pile
        var pile = this.getNimPile(pileNo);
        for (var i = pile.children.length - 1; i >= newSize; i--) {
            pile.removeChild(pile.children[i]);
        }
    };
    NimGUI.prototype.removeEvenCountPiles = function () {
        // No Even Pile Nim:
        // All piles of the same size and even in count are removed
        var sizes = this.getPileSizes();
        var counts = [];
        for (var i = 0; i < sizes.length; i++) {
            counts[sizes[i]] = (counts[sizes[i]] || 0) + 1;
        }
        var removeSizes = [];
        for (var i = 0; i < counts.length; i++) {
            if (counts[i] % 2 == 0) {
                removeSizes.push(i);
            }
        }
        for (var i = 0; i < sizes.length; i++) {
            if (removeSizes.includes(sizes[i])) {
                // Remove this pile
                this._reduceNimPile(i, 0);
            }
        }
    };
    NimGUI.prototype.changePlayer = function (newPlayer) {
        if (isNumberObject(newPlayer)) {
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
    };
    NimGUI.prototype.onPlayerChanged = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sizes, nimSum, i, idx, threshold, i, newSize, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.onPlayerChangedListener("Player " + this.player);
                        if (!(this.vsCPU && this.player == 2)) return [3 /*break*/, 2];
                        // Play as CPU
                        // Wait a bit
                        return [4 /*yield*/, sleep(NimGUI.SLEEP_MS)];
                    case 1:
                        // Play as CPU
                        // Wait a bit
                        _a.sent();
                        sizes = this.getPileSizes();
                        nimSum = 0;
                        for (i = 0; i < sizes.length; i++) {
                            nimSum ^= sizes[i];
                        }
                        if (nimSum != 0) {
                            idx = 1;
                            while (true) {
                                if (nimSum >> idx == 0) {
                                    idx -= 1;
                                    break;
                                }
                                idx++;
                            }
                            threshold = 1 << idx;
                            // Reduce the first pile we found optimal move
                            for (i = 0; i < sizes.length; i++) {
                                if (sizes[i] >= threshold) {
                                    newSize = sizes[i] ^ nimSum;
                                    this.reduceNimPile(i, newSize);
                                    return [2 /*return*/];
                                }
                            }
                        }
                        else {
                            // No optimal move
                            // Reduce one from any
                            for (i = 0; i < sizes.length; i++) {
                                if (sizes[i] > 0) {
                                    this.reduceNimPile(i, sizes[i] - 1);
                                    return [2 /*return*/];
                                }
                            }
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    NimGUI.prototype.onNimPileChanged = function (pile, exSize, newSize) {
        this.removeEvenCountPiles();
        // Check if game over
        var sizes = this.getPileSizes();
        if (!sizes.find(function (v) { return v; })) {
            // There is no non-zero nim pile, game over
            this.onGameOverListener("Player " + this.player);
            return;
        }
        // Change player
        this.changePlayer();
    };
    NimGUI.prototype.makeNimPile = function (pileNo, size) {
        var pile = document.createElement("div");
        pile.dataset.pileNo = pileNo.toString();
        pile.classList.add("nimPile");
        for (var i = 0; i < size; i++) {
            var chip = this.makeNimChip();
            pile.appendChild(chip);
        }
        return pile;
    };
    NimGUI.prototype.resetGame = function (nim) {
        this.nim = nim;
        this.player = 1;
        // Clean game
        this.changePlayer(this.player);
        this.game.innerHTML = "";
        var initialPileSizes = [];
        for (var i = 0; i < nim; i++) {
            var size = Math.floor(Math.random() * 10);
            initialPileSizes.push(size);
        }
        // Create piles
        for (var i = 0; i < nim; i++) {
            // Create pile
            var pile = this.makeNimPile(i, initialPileSizes[i]);
            // Put pile
            this.game.appendChild(pile);
        }
        this.removeEvenCountPiles();
    };
    NimGUI.nims = [];
    NimGUI.SLEEP_MS = 3000;
    return NimGUI;
}());
export default NimGUI;
