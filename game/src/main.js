// @ts-check

import { k } from "./kaplay.js"; // init game lib
import "./assets.js"; // load assets
import "./scenes/game.js"; // load game scene
import "./scenes/endGame.js"; // load endGame scene
import "./scenes/selectionScene.js";
import "./scenes/about.js";
import "./data/changeStyle.js";
import "./data/utilities.js";
k.go("selection");
