// @ts-check
import { k } from "./kaplay.js";
k.loadFont("jetbrains", "/fonts/jetbrains.ttf", {
    outline: {
        width: 6,
        color: k.rgb(8, 8, 8)
    },
});
k.loadSprite("bg2", "/sprites/bg2.png");
k.loadSound("code_sound", "/sounds/code_sound.mp3");
k.loadSound("wrong_typing", "/sounds/wrong typing.mp3");
k.loadSprite("muteON", "/sprites/muteON.png");
k.loadSprite("muteOff", "/sprites/muteOFF.png");
k.loadSprite("WPM", "/sprites/WPM.png");