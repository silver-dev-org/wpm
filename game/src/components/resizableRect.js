/**
 * @typedef {import("kaplay").Vec2} Vec2
 * @typedef {import("kaplay").GameObj} GameObj
 * @typedef {import("kaplay").RectComp} RectComp
 */

import { data } from "../constants.js";
import { k } from "../kaplay.js";

/**
 * Set the rect on resize
 *
 * @param {() => Vec2} resizeFunc
 */
export const resizableRect = (resizeFunc) => ({
    id: "resizableRect",
    resizeFunc,
    add() {
        this.use(k.rect(this.resizeFunc().x, this.resizeFunc().y));
    },
    updateRectSize() {
        this.use(k.rect(this.resizeFunc().x, this.resizeFunc().y));
    },
    destroy() {
        data.resizableObjects = data.resizableObjects.filter(
            (obj) => obj !== this,
        );
    },
});
