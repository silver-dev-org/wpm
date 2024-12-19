// @ts-check

import dialogs from "./data/dialogs.json";
export const EASY_RIVAL_SPEED = 1;
export const MAX_TIME = 60;
export const goalBlocks = 2;
export const maxMistakes = 2;
export const lineHeight = 48;
export const charSpacing = 10;
export const startmoveline = 1;
export const marginvisiblebox = 1;
export const dialogsData = dialogs;
// modifiable data in game
export const gameState = {
    /**
     * Allocated resizable objects for update on resize
     *
     * @type {import("kaplay").GameObj[]}
     */
    resizableObjects: [],
    /**
     * Time left
     */
    timeLeft: 0,
};
