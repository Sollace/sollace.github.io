
const keys = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
    SHIFT: 16
};
const heldKeys = {};

window.addEventListener('keydown', ev => heldKeys[ev.which] = 1);
window.addEventListener('keyup', ev => heldKeys[ev.which] = 0);

setInterval(() => {
    let yChange = 0;
    let xChange = 0;

    if (heldKeys[keys.UP] || heldKeys[keys.W]) yChange--;
    if (heldKeys[keys.DOWN] || heldKeys[keys.S]) yChange++;
    if (heldKeys[keys.LEFT] || heldKeys[keys.A]) xChange--;
    if (heldKeys[keys.RIGHT] || heldKeys[keys.D]) xChange++;

    if (xChange != 0 || yChange != 0) {
        if (heldKeys[keys.SHIFT]) {
            xChange *= 4;
            yChange *= 4;
        }
        scrollViewPort(document.querySelector('level'), xChange, yChange);
        xChange = 0;
        yChange = 0;
    }
}, 150);
