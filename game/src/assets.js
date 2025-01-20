// @ts-check

import { k } from "./kaplay.js";

k.loadFont("monogram", "/fonts/monogram.ttf", {
    outline: 6,
    filter: "nearest",
});

k.loadMusic("intro", "/sounds/intro.mp3");
k.loadMusic("videogame", "/sounds/videogame.mp3");
k.loadMusic("code_sound", "/sounds/code_sound.mp3");
k.loadMusic("wrong_typing", "/sounds/wrong typing.mp3");
k.loadSprite("bgpng", "/sprites/bgpng.png");
k.loadSprite("bg3", "/sprites/bg3.png");
k.loadSprite("bg2", "/sprites/bg2.png");
k.loadSprite("bg", "/sprites/bg.png");
k.loadSprite("muteON", "/sprites/muteON.png");
k.loadSprite("muteOff", "/sprites/muteOFF.png");
k.loadSprite("WPM", "/sprites/WPM.png");
k.loadSprite("icon_0", "/sprites/icon_0.png");
k.loadSprite("icon_01", "/sprites/icon_01.png");
k.loadSprite("icon_02", "/sprites/icon_02.png");
k.loadSprite("icon_03", "/sprites/icon_03.png");
k.loadSprite("icon_04", "/sprites/icon_04.png");
k.loadSprite("arrow_yellow", "/sprites/arrow_yellow.png");
k.loadSprite("9slice", "/sprites/bg2.png", {
    slice9: {
        left: 32,
        right: 32,
        top: 32,
        bottom: 32,
    },
    
});