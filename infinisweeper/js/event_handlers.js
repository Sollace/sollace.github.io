
const resetCallbacks = [];

function addBubblingListener(event, selector, callback) {
    document.addEventListener(event, ev => {
        let target = ev.target.closest(selector);
        if (target) callback(target, ev);
    });
}
