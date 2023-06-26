
const defaultNewCell = JSON.stringify({
    opened: false,
    bomb: false,
    loaded: false
});

function getOrCreateCellData(x, y) {
    const key = `cell%${x}%${y}`;
    return JSON.parse(localStorage[key] || defaultNewCell);
}

function storeCell(x, y, state) {
    localStorage[`cell%${x}%${y}`] = JSON.stringify(state);
}

function getIndex(x, y) {
    return (x - gameState.viewport.x) + ((y - gameState.viewport.y) * gameState.viewport.w);
}

function getCellAttributes(index) {
    index = parseInt(index);
    const x = Math.floor(index % gameState.viewport.w);
    const y = Math.floor(index / gameState.viewport.w);
    const globalX = x + gameState.viewport.x;
    const globalY = y + gameState.viewport.y;
    return {
        index,
        x, y,
        globalX,
        globalY,
        state: getOrCreateCellData(globalX, globalY)
    };
}

function openBranch(target) {
    const cell = getCellAttributes(target.dataset.index);
    const level = target.parentNode;
    if (gameState.checkFirstClick()) {
        cell.loaded = true;
    }

    cell.state.opened = true;
    storeCell(cell.globalX, cell.globalY, cell.state);
    Object.values(revealBranch(cell.globalX, cell.globalY, cell.state)).forEach(repaintCell);
}

addBubblingListener('mousemove', 'cell', target => {
    gameState.focusedCell = getCellAttributes(target.dataset.index);
});
