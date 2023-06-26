
const neighbourMatrix = [
    [-1, -1], [0, -1], [1, -1],
    [-1,  0],          [1,  0],
    [-1,  1], [0,  1], [1,  1]
];

function generateNeighbours(cell) {
    return generateCellNeighbours(cell.globalX, cell.globalY, cell.state);
}

function generateCellNeighbours(x, y, cell) {
    cell.count = neighbourMatrix
        .map(offset => [x + offset[0], y + offset[1]])
        .filter(offset => countOrCreateNeighbour(offset[0], offset[1]))
        .length;

    if (cell.bomb) {
        return -1;
    }
    return cell.count;
}

function countOrCreateNeighbour(x, y) {
    return generateBomb(x, y, getOrCreateCellData(x, y));
}

function generateBomb(x, y, properties) {
    if (!properties.loaded) {
        properties.loaded = true;
        if (!properties.opened) {
          properties.bomb = Math.random() <= gameState.getBombRate();
        }
        storeCell(x, y, properties);
        repaintCell(getIndex(x, y));
    }
    return !!properties.bomb;
}

function revealBranch(startX, startY, recurseLimit, affectedIndices) {
    affectedIndices = affectedIndices || {};
    recurseLimit = recurseLimit == undefined ? 7 : (recurseLimit - 1);
    if (recurseLimit <= 0) return;

    countOrCreateNeighbour(startX, startY);

    forEachNeighbours(startX, startY, (x, y) => {
        const index = getIndex(x, y);
        if (!affectedIndices[index]) {
            affectedIndices[index] = index;
            const cell = getOrCreateCellData(x, y);
            const neighbourCount = generateCellNeighbours(x, y, cell);
            if (!cell.opened && neighbourCount >= 0) {
                cell.opened = true;
                addScore(neighbourCount < 0 ? -15 : neighbourCount);
                storeCell(x, y, cell);
                if (neighbourCount == 0) {
                    revealBranch(x, y, recurseLimit, affectedIndices);
                }
            }
        }
    });

    return affectedIndices;
}

function forEachNeighbours(x, y, action) {
    neighbourMatrix
        .map(offset => [x + offset[0], y + offset[1]])
        .forEach(offset => action(offset[0], offset[1]));
}
