
const gameState = {
    viewport: { x: 0, y: 0, w: 0, h: 0, zoom: 1 },
    developerMode: false,
    focusedCell: null,
    bombRate: 0.23,
    getBombRate() {
        if (!localStorage["hasHadFirstClick"]) {
            return -1;
        }
        return this.bombRate
    },
    checkFirstClick() {
        if (!localStorage["hasHadFirstClick"]) {
            localStorage["hasHadFirstClick"] = 1;
            return true;
        }
        return false;
    }
};

function buildLevel(level) {
    const properties = getGlobalCssProperties(level);
    resizeViewPort(level, properties.width, properties.height);
}

function getGlobalCssProperties(level) {
    const css = window.getComputedStyle(level);
    const levelBounds = level.getBoundingClientRect();
    const cellSize = parseFloat(css.getPropertyValue('--cell-size'));
    const cellSpacing = parseFloat(css.getPropertyValue('--level-grid-width')) * 2;
    return {
        width: Math.floor(Math.floor(levelBounds.width) / (cellSize + cellSpacing)),
        height: Math.floor(Math.floor(levelBounds.height) / (cellSize + cellSpacing)),
        scale: parseFloat(css.getPropertyValue('--level-scale') || '1'),
        cellSize,
        cellSpacing
    };
}

function scrollViewPort(level, changeX, changeY) {
    changeX = isNaN(changeX) ? 0 : changeX;
    changeY = isNaN(changeY) ? 0 : changeY;
    gameState.viewport.x += changeX;
    gameState.viewport.y += changeY;
    writeViewportToElement(level);
    document.location.hash = `${gameState.viewport.x};${gameState.viewport.y}`;
    resizeViewPort(level, gameState.viewport.w, gameState.viewport.h);
}

function resizeViewPort(level, columns, rows) {
    gameState.viewport.w = columns;
    gameState.viewport.h = rows;
    writeViewportToElement(level);
    level.innerHTML =
        createArray(columns * rows, cellHtml).join('')
        + enemies.map(createEnemyHtml).join('');
}

function writeViewportToElement(level) {
    level.classList.toggle('developer-mode', gameState.developerMode);
    level.style.setProperty('--columns', gameState.viewport.w);
    level.style.setProperty('--rows', gameState.viewport.h);
    level.style.setProperty('--x', gameState.viewport.x);
    level.style.setProperty('--y', gameState.viewport.y);
}

function cellHtml(o, index) {
    return createCellHtml(getCellAttributes(index));
}

function createCellHtml(cell) {
    return `<cell data-index="${cell.index}"
        data-opened="${cell.state.opened}"
        data-count="${cell.state.count || 0}"
        data-flag="${cell.state.flagged || false}"
        data-loaded="${cell.state.loaded || false}"
        ${(cell.state.opened || gameState.developerMode) && cell.state.bomb ? 'data-bomb="true"' : ''}></cell>`;
}

function createEnemyHtml(enemy) {
    return `<enemy data-index="${enemy.index}" style="--column:${enemy.x};--row:${enemy.y}"></enemy>`;
}

function repaintCell(index) {
    pendingUpdates[index] = index;
}

function createArray(len, factory) {
    const arr = Array(Math.floor(len)).fill(0);
    return arr.map(factory);
}

let pendingUpdates = {};

setInterval(() => {
    const updatedThisFrame = Object.values(pendingUpdates);
    pendingUpdates = {};

    updatedThisFrame.forEach(index => {
        const element = document.querySelector(`level cell[data-index="${index}"]`);
        if (element) {
            element.outerHTML = createCellHtml(getCellAttributes(index));
        }
    });
}, 150);

resetCallbacks.push(() => buildLevel(document.querySelector('level')));

document.addEventListener('DOMContentLoaded', () => {
    const pair = document.location.hash.replace('#', '')
        .split(';')
        .map(parseFloat)
        .filter(a => !isNaN(a));

    if (pair.length == 2) {
        gameState.viewport.x = pair[0];
        gameState.viewport.y = pair[1];
    }

    buildLevel(document.querySelector('level'));
    gameState.focusedCell = getCellAttributes(0);
});
window.addEventListener('resize', () => buildLevel(document.querySelector('level')));
