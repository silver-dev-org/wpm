// @ts-check

import { k } from "./kaplay.js"; // init game lib
import "./assets.js"; // load assets
import "./scenes/game.js"; // load game scene
import "./scenes/endGame.js"; // load endGame scene
import { EASY_RIVAL_SPEED } from "./constants.js";

k.go("game", {
    rivalSpeed: EASY_RIVAL_SPEED,
});
