import { k } from "../kaplay";
import { EASY_RIVAL_SPEED } from "../constants";
import { savePlay, getPlay } from "../systems/saves.js";

export let actualname;

k.scene("name_selection", () => {
    
    k.add([
        k.anchor("top"),
        k.pos(k.width() / 2, k.height() / 8),
        k.text("Insert your name"),
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
        k.textInput(true, 20), 
        k.pos(k.width() / 2, k.height() / 2.5), 
        k.anchor("center"),
        k.z(21),
    ]);
    
    const nameLines = k.add([
        k.text("_".repeat(5), { size: 36 }), 
        k.pos(k.width() / 2, k.height() / 2.5 + 20), 
        k.color(k.YELLOW),
        k.anchor("center"),
        k.z(20),
    ]);

    name.onUpdate(() => {
        const lineLength = Math.min(20, Math.max(5, name.text.length)); 
        nameLines.text = "_".repeat(lineLength);
    });

    k.onKeyPress("enter", () => {

        const playData = {
            userName: name.text, 
        };

      
        savePlay(playData); 
        
        k.go("game", {
            rivalSpeed: EASY_RIVAL_SPEED,
            userName: name.text,
        });
    });

    const challengetitles = k.add([
        k.text("Select challenge", { size: 32 }),
        k.pos(k.width() / 2, k.height() / 1.5), 
        k.anchor("center"),
        k.z(21),
    ]);

    const options = ["easy", "medium", "high"];
    let selectedOption = 0;

    const optionTexts = options.map((option, index) => {
        return k.add([
            k.text(option, { size: 24 }),
            k.pos(k.width() / 4 + index * (k.width() / 4), k.height() / 1.3), 
            k.anchor("center"),
            k.z(20),
        ]);
    });

    const selector = k.add([
        k.rect(200, 30), 
        k.pos(k.width() / 4 + selectedOption * (k.width() / 4) - 100, k.height() / 1.3 - 10), 
        k.color(255, 255, 255), 
        k.z(19),
    ]);

    k.onKeyPress("right", () => {
        selectedOption = (selectedOption + 1) % options.length;
        selector.pos.x = k.width() / 4 + selectedOption * (k.width() / 4) - 100;
    });

    k.onKeyPress("left", () => {
        selectedOption = (selectedOption - 1 + options.length) % options.length;
        selector.pos.x = k.width() / 4 + selectedOption * (k.width() / 4) - 100;
    });

    k.onMouseMove((pos) => {
        optionTexts.forEach((option, index) => {
            if (pos.x > option.pos.x - option.width / 2 && pos.x < option.pos.x + option.width / 2 &&
                pos.y > option.pos.y - option.height / 2 && pos.y < option.pos.y + option.height / 2) {
                selectedOption = index;
                selector.pos.x = option.pos.x - 100; 
            }
        });
    });
});
