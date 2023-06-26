
let enemies = JSON.parse(localStorage['enemies'] || '[]');
const enemyTypes = {};

function spawnEnemy(x, y, type) {
    const enemy = { x, y, type, initial: true, index: getIndex(x, y) };
    enemies.push(enemy);
    localStorage['enemies'] = JSON.stringify(enemies);
    const level = document.querySelector('level');
    level.insertAdjacentHTML('beforeend', createEnemyHtml(enemy))
}

function moveEnemy(enemy, changeX, changeY) {
    const element = document.querySelector(`enemy[data-index="${enemy.index}"]`);
    enemy.x += changeX;
    enemy.y += changeY;
    enemy.dirty = true;
    element.outerHTML = createEnemyHtml(enemy);
}

setInterval(() => {
    if (enemies.length) {
        let dirty = false;
        enemies = enemies.filter(enemy => {
            enemyTypes[enemy.type].update(enemy);
            dirty |= enemy.dirty;
            enemy.initial = false;
            enemy.dirty = false;
            if (enemy.dead) {
                const element = document.querySelector(`enemy[data-index="${enemy.index}"]`);
                if (element) {
                    element.remove();
                }
                return false;
            }
            return true;
        });

        if (dirty) {
            localStorage['enemies'] = JSON.stringify(enemies);
        }
    }
}, 100);

resetCallbacks.push(() => enemies.clear());

const directions = {};
function initDirection(name, vector, prev, next) {
    directions[name] = {
        vector,
        rotate(forwards) {
            return forwards ? next : prev;
        }
    };
}
initDirection('up', [0, -1], 'left', 'right');
initDirection('down', [0, 1], 'right', 'left');
initDirection('left', [-1, 0], 'down', 'up');
initDirection('right', [1, 0], 'up', 'down');
const directionsArray = Object.keys(directions);

enemyTypes.snake = {
    update(enemy) {

        if (enemy.initial) {
            enemy.health = 5 + Math.floor(Math.random() * 50);
            enemy.direction = directionsArray[Math.floor(Math.random() * directionsArray.length)];
        }

        if (Math.random() < 0.2) {
            enemy.direction = directions[enemy.direction].rotate(Math.random() > 0.5);
        }
        const vector = directions[enemy.direction].vector;

        moveEnemy(enemy, vector[0], vector[1]);

        const index = getIndex(enemy.x, enemy.y);
        const cell = getCellAttributes(index);
        let count = generateNeighbours(cell);
        if (count >= 0) {
            cell.count = count;
        } else if (enemy.health-- <= 0) {
            enemy.dead = true;
        }
        enemy.dirty = true;

        cell.opened = true;
        cell.loaded = true;
        storeCell(cell.globalX, cell.globalY, cell);
        repaintCell(index);
    }
}
