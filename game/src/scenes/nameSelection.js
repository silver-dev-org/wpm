// @ts-check

import { k } from "../kaplay";
import { EASY_RIVAL_SPEED } from "../constants";



k.scene("name_selection", () => {
    k.add([
        k.anchor("top"),
        k.pos(k.width() / 2, k.height() / 8),
        k.text("Insert you name"),
        k.z(21),
    ]);
    const background = k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);
    const name = k.add([
        k.text(""),
        k.textInput(true, 10),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(21),
    ]);

    k.onKeyPress("enter", () => {
        k.go("game", {
            rivalSpeed: EASY_RIVAL_SPEED,
            userName: name.text,
        });
    });
});
