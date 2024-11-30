/**
 * @typedef {import("../types").Vec2} Vec2
 */

export let resizableObjects = [];

/**
 * Set the position on resize
 *
 * @param {() => Vec2} posFunc
 */
export const resizablePos = (posFunc) => ({
    id: "resizablePos",
    posFunc,
    add() {
        resizableObjects.push(this);
        this.pos = this.posFunc();
    },
    updatePos() {
        this.pos = this.posFunc();
    },
});
