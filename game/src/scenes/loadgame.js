scene("loadgame", () => {

    const endgameLabel = add([
        text("Analytics", { size: 48 }),
        pos(center().x, center().y - 100),
        anchor("center"),
    ]);

    const WPMLabel = add([
        text("WPM", { size: 48 }),
        pos(center().x - 200, center().y + 50),
        anchor("center"),
    ]);

    const LOClabel = add([
        text("LOC", { size: 48 }),
        pos(center().x, center().y + 50),
        anchor("center"),
    ]);

    const ACClabel = add([
        text("ACC", { size: 48 }),
        pos(center().x + 200, center().y + 50),
        anchor("center"),
    ]);

    console.log(acc);
});


