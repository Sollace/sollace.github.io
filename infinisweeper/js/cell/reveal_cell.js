
function openSingleCell(target) {
    const cell = getCellAttributes(target.dataset.index);
    const level = target.parentNode;

    if (cell.state.opened) return;

    if (gameState.checkFirstClick()) {
        cell.loaded = true;
    } else {
        if (Math.random() <= 0.03) {
            //spawnEnemy(cell.globalX, cell.globalY, 'snake');
        }
    }

    const neighbourCount = generateNeighbours(cell);

    if (neighbourCount == 0) {
        Object.values(revealBranch(cell.globalX, cell.globalY, cell.state)).forEach(repaintCell);
    }
    cell.state.opened = true;
    addScore(neighbourCount < 0 ? -15 : neighbourCount);
    storeCell(cell.globalX, cell.globalY, cell.state);
    target.outerHTML = createCellHtml(cell);
}

addBubblingListener('click', 'cell', openSingleCell);
