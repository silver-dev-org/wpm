// @ts-check

import dialogs from "./data/dialogs.json";
export const EASY_RIVAL_SPEED = 1;
export const MAX_TIME = 60;
export const goalBlocks = 3;
export const maxMistakes = 2;
export const lineHeight = 24;
export const charSpacing = 30;
export const startmoveline = 1;
export const marginvisiblebox = 1;
export const dialogsData = dialogs;
export const JUMP_AFTER = 1;

/**
 * Object for manage different states and configurations in the game
 */
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
