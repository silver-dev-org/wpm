/**
 * @typedef {import("kaplay").Vec2} Vec2
 * @typedef {import("kaplay").GameObj} GameObj
 * @typedef {import("kaplay").PosComp} PosComp
 */

import { gameState } from "../constants.js";

/**
 * Set the position on resize
 *
 * @param {() => Vec2} sizeFunc
 */
export const resizablePos = (sizeFunc) => ({
    id: "resizablePos",
    sizeFunc,
    add() {
        gameState.resizableObjects.push(this);
        this.pos = this.sizeFunc();
    },
    /**
     * @type { GameObj<PosComp> } this
     */
    updatePos() {
        this.pos = this.sizeFunc();
    },
    destroy() {
        gameState.resizableObjects = gameState.resizableObjects.filter(
            (obj) => obj !== this,
        );
    },
});
