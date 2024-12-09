// @ts-check

import dialogs from "./data/dialog.json";

export const goalBlocks = 2;
export const maxtime = 500;
export const maxMistakes = 2;
export const lineHeight = 24;
export const charSpacing = 10;
export const startmoveline = 1;
export const marginvisiblebox = 1;
export const jsonData = dialogs;
// modifiable data in game
export const data = {
    /**
     * Allocated resizable objects for update on resize
     *
     * @type {import("kaplay").GameObj[]}
     */
    resizableObjects: [],
};
