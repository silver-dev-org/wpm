// @ts-check

import { k } from "../kaplay";

/**
 * a PlaySave
 *
 * @typedef {Object} PlaySave
 * @property {string} userName
 * @property {number} lpm
 * @property {number} wpm
 * @property {number} acc
 * @property {number} mute
 */

/**
 * Save a PLAY
 *
 * @param {PlaySave} play
 */
export const savePlay = (play) => {
    k.setData(play.userName, JSON.stringify(play));
};

/**
 * Get a PLAY by a username
 *
 * @param {string} username
 * @returns { PlaySave | null }
 */
export const getPlay = (username) => {
    return k.getData(username, null);
};
