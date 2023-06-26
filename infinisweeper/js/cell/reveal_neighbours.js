
function revealNeighbours(target) {
    const cell = getCellAttributes(target.dataset.index);

    if (!cell.state.opened) {
        return;
    }

    const bombCount = generateNeighbours(cell);

    let revealedBombCount = 0;
    const unrevealedSpaces = [];

    forEachNeighbours(cell.globalX, cell.globalY, (x, y) => {
        const neighbour = getOrCreateCellData(x, y);
        generateCellNeighbours(x, y, neighbour);

        if (neighbour.bomb && (neighbour.opened || neighbour.flagged)) {
            revealedBombCount++;
        }
        if (!neighbour.opened && !neighbour.bomb) {
            unrevealedSpaces.push({x, y, neighbour });
        }
    });

    if (revealedBombCount >= bombCount) {
        unrevealedSpaces.forEach(space => {
            space.neighbour.opened = true;
            addScore(space.neighbour.count);
            storeCell(space.x, space.y, space.neighbour);
            repaintCell(getIndex(space.x, space.y));

            if (space.neighbour.count == 0) {
                Object.values(revealBranch(space.x, space.y, 4)).forEach(repaintCell);
            }
        });
    }
}

addBubblingListener('click', 'cell[data-opened=true]', revealNeighbours);
