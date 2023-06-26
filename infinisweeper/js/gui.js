
const gameAttributes = {
    score: getScore,
    high_score: getHighScore,
    streak: getStreak,
    zoom() {
        return gameState.viewport.zoom;
    },
    map_coordinates() {
        return `MapX: ${gameState.viewport.x} MapY: ${gameState.viewport.y}`;
    },
    coordinates() {
        return `X: ${gameState.focusedCell.globalX} Y: ${gameState.focusedCell.globalY}`;
    }
}

const buttonActions = {
    toggle(target) {
        document.querySelector(target.dataset.target).classList.toggle('hidden');
    },
    reset() {
        const highScore = getHighScore();
        localStorage.clear();
        localStorage['playerHighScore'] = highScore;
        resetCallbacks.forEach(callback => callback());
    },
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage['darkMode'] = document.body.classList.contains('dark-mode');
    },
    capture(ev) {}
};

setInterval(() => {
    document.querySelectorAll('hud entry[data-game-attribute]').forEach(entry => {
        const attribute = gameAttributes[entry.dataset.gameAttribute.toLowerCase().replace(' ', '_')];
        if (attribute) {
            entry.innerText = attribute();
        }
    });
}, 150);

addBubblingListener('click', '[data-click]', (target, ev) => {
    const handler = buttonActions[target.dataset.click];
    if (handler) handler(target, ev);
});

document.addEventListener('DOMContentLoaded', () => {
   document.body.classList.toggle('dark-mode', localStorage['darkMode'] == 'true');
});
