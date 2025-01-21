import { k } from "../kaplay";
import { EASY_RIVAL_SPEED } from "../constants";
import { savePlay } from "../systems/saves.js";
export let actualname;

k.scene("name_selection", () => {
    k.add([
        k.anchor("top"),
        k.pos(k.width() / 2 - 250, k.height() / 4),
        k.text("Typing", {
            size: 32,
        }),
        k.color(k.WHITE),
        k.z(21),
    ]);


    k.add([
        k.anchor("top"),
        k.pos(k.width() / 2 - 140, k.height() / 4),
        k.text("Start", {
            size: 32,
        }),
        k.color(k.YELLOW),
        k.z(21),
    ]);


    k.add([
        k.anchor("top"),
        k.pos(k.width() / 2 + 150, k.height() / 4),
        k.text("to begin the code speed test", {
            size: 32,
        }),
        k.color(k.WHITE),
        k.z(21),
    ]);

    const background = k.add([
        k.sprite("bg2"),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.z(18),
    ]);

    const name = k.add([
        k.text("", {
            size: 32,

        }),
        k.textInput(true, 20),
        k.pos(k.width() / 2, k.height() / 2.0),
        k.anchor("center"),
        k.color(k.YELLOW),
        k.z(21),
    ]);

    const nameLines = k.add([
        k.text("_".repeat(5), {
            size: 32,
        }),
        k.pos(k.width() / 2, k.height() / 2.0 + 30),
        k.color(k.MAGENTA),
        k.anchor("center"),
        k.z(20),
    ]);

    name.onUpdate(() => {
        const lineLength = Math.min(20, Math.max(5, name.text.length));
        nameLines.text = "_".repeat(lineLength);

        if (name.text === "Start") {
            const playData = {
                userName: name.text,
            };

            savePlay(playData);
            k.go("game", {
                rivalSpeed: EASY_RIVAL_SPEED,
                userName: name.text,
            });
        }
    });

});
