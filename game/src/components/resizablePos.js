/**
 * @typedef {import("kaplay").Vec2} Vec2
 * @typedef {import("kaplay").GameObj} GameObj
 * @typedef {import("kaplay").PosComp} PosComp
 */

import { data } from "../constants.js";


/**
 * Set the position on resize
 *
 * @param {() => Vec2} sizeFunc
 */
export const resizablePos = (sizeFunc) => ({
    id: "resizablePos",
    sizeFunc,
    add() {
        data.resizableObjects.push(this);
        this.pos = this.sizeFunc();
    },
    /**
     * @type { GameObj<PosComp> } this
     */
    updatePos() {
        this.pos = this.sizeFunc();
    },
    destroy() {
        data.resizableObjects = data.resizableObjects.filter((obj) => obj !== this);
    }
});
