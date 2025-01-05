// @ts-check

import { k } from "./kaplay.js"; // init game lib
import "./assets.js"; // load assets
import "./scenes/game.js"; // load game scene
import "./scenes/endGame.js"; // load endGame scene
import "./scenes/nameSelection.js";
import { EASY_RIVAL_SPEED } from "./constants.js";

k.go("name_selection");
