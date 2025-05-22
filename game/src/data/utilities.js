let capsLockActive = false;

export function toggleCapsLock() {
    capsLockActive = !capsLockActive;
}
export function setCapsLockActive(value) {
    capsLockActive = value;
}
export function shouldUppercase(k) {
    const shift = k.isKeyDown("shift");
    return (shift && !capsLockActive) || (!shift && capsLockActive);
}

export function escapeBackslashes(str) {
    return str.replace(/\\/g, "\\\\");
}

export function preventError(k, settings) {
    k.shake(2);
    if (!settings?.mute) {
        k.play("wrong_typing");
    }
}

export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function makeBlink(k, entity) {
    k.loop(0.5, () => {
        entity.opacity = entity.opacity === 0 ? 0.8 : 0;
    });
}
