const MINE = '💣'
const EMPTY = ' ';

localStorage.setItem("easyBestScore", 1000);
localStorage.setItem("mediumBestScore", 1000);
localStorage.setItem("extremeBestScore", 1000);

var gHintIsOn = false;
var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 0
}
var GAMER_HINT1 = '<img src="img/hint.png"/>';
var GAMER_HINT2 = '<img src="img/hint.png"/>';
var GAMER_HINT3 = '<img src="img/hint.png"/>';
renderHints(GAMER_HINT1, GAMER_HINT2, GAMER_HINT3);

var gTimer;

//disable menu on rifht click
window.addEventListener("contextmenu", e => e.preventDefault());

function initGame() {
    var elSmile = document.querySelector('.smile')
    elSmile.innerHTML = '🤠';
    gGame.shownCount = 0;
    gGame.secsPassed = 0;
    gGame.isOn = true;
    gGame.lives = 3;
    renderLIVES();
    clearInterval(gTimer)
    renderTime()
    gBoard = buildBoard()
    renderBoard(gBoard);
    GAMER_HINT1 = '<img src="img/hint.png"/>';
    GAMER_HINT2 = '<img src="img/hint.png"/>';
    GAMER_HINT3 = '<img src="img/hint.png"/>';
    renderHints(GAMER_HINT1, GAMER_HINT2, GAMER_HINT3);
}

function renderHints(hint1, hint2, hint3) {
    var elHint1 = document.querySelector('.hints-container');
    elHint1.innerHTML = `<span onclick="onHint1click()" class="hint1">${hint1}</span>`;
    var elHint2 = document.querySelector('.hints-container');
    elHint2.innerHTML += `<span onclick="onHint2click()" class="hint2">${hint2}</span>`;
    var elHint3 = document.querySelector('.hints-container');
    elHint3.innerHTML += `<span onclick="onHint3click()" class="hint3">${hint3}</span>`;
}

function onHint1click() {
    GAMER_HINT1 = `<img src="img/hintClicked.png"/>`
    renderHints(GAMER_HINT1, GAMER_HINT2, GAMER_HINT3)
    gHintIsOn = true;
}

function onHint2click() {
    GAMER_HINT2 = `<img src="img/hintClicked.png"/>`
    renderHints(GAMER_HINT1, GAMER_HINT2, GAMER_HINT3)
    gHintIsOn = true;
}

function onHint3click() {
    GAMER_HINT3 = `<img src="img/hintClicked.png"/>`
    renderHints(GAMER_HINT1, GAMER_HINT2, GAMER_HINT3)
    gHintIsOn = true;
}

function hint(board, rowIdx, colIdx) {
    var elNegCell;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            // if (i === rowIdx && j === colIdx) continue
            if (gBoard[i][j].isShown) continue
            var classname = getClassName({ i: i, j: j });
            elNegCell = document.querySelector(`.${classname}`);
            elNegCell.classList.remove('closed')
        }
    }
    setTimeout(closeAfterHint, 1000)
    gHintIsOn = false;
}

function hintDisappear() {

}

function closeAfterHint(board, rowIdx, colIdx) {
    var elNegCell;
    console.log('hi')
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            // if (i === rowIdx && j === colIdx) continue
            if (gBoard[i][j].isShown) continue
            if(gBoard[i][j].isMarked) console.log('dd')
            var classname = getClassName({ i: i, j: j });
            elNegCell = document.querySelector(`.${classname}`);
            elNegCell.classList.add('closed')
        }
    }
    renderBoard(gBoard)
}

function start() {
    gTimer = setInterval(updateTime, 1000)
}

function updateTime() {
    gGame.secsPassed += 1;
    renderTime();
}

function renderTime() {
    var elTime = document.querySelector('.timer')
    elTime.innerHTML = 'Seconds Passed: ' + gGame.secsPassed;
}
function renderLIVES() {
    var elLives = document.querySelector('.lives')
    elLives.innerHTML = `${gGame.lives} ❤️ LEFT`
}


function buildBoard() {
    var board = createMat(gLevel.SIZE, gLevel.SIZE)
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = {
                minesAroundCount: setMinesNegsCount(i, j, board),
                isShown: false,
                isMine: false,
                isMarked: false
            };
            board[i][j] = cell;
        }
    }

    var randomEmptyLocations = getRandomEmptyLocation(board);
    for (var i = 0; i < gLevel.MINES; i++) {
        var currLocation = randomEmptyLocations.pop()
        var randomI = currLocation.i;
        var randomJ = currLocation.j;
        board[randomI][randomJ].isMine = true;
    }

    return board;
}

function setMinesNegsCount(rowIdx, colIdx, board) {
    var minesCounter = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isMine) minesCounter++;
        }
    }
    return minesCounter;
}


function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })
            if (!currCell.isShown) {
                cellClass += ' closed'
            }

            var countMines = setMinesNegsCount(i, j, board)
            gBoard[i][j].minesAroundCount = countMines

            strHTML += `\t<td class="cell ${cellClass}
            " onclick="cellClicked((this),${i},${j})" onmousedown="mouseDown(event,(this),${i},${j})">\n`;

            if (!currCell.isMine) {
                if (countMines === 0) continue
                strHTML += `<span>${countMines}</span>`;
            } else if (currCell.isMine) {
                strHTML += `<span>${MINE}</span>`;
            }
            else strHTML += EMPTY;

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;

}


function cellClicked(elCell, i, j) {
    if (gHintIsOn) {
        hint(gBoard, i, j)
    }
    else {
        if (gGame.shownCount === 0 && !gBoard[i][j].isMine) {
            start()
        }
        if (gBoard[i][j].isShown) return
        if (gBoard[i][j].isMarked) return
        playClickSound()
        if (gBoard[i][j].minesAroundCount > 0 && !gBoard[i][j].isMine) {
            gBoard[i][j].isShown = true;
            elCell.classList.remove("closed")
            gGame.shownCount++;
        }
        if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount === 0) {
            expandShown(gBoard, elCell, i, j)
        }
        if (gBoard[i][j].isMine) gameOver()
        checkVictory()
    }

}


function cellMarked(elCell, i, j) {
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) {
        elCell.classList.remove("marked")
        gBoard[i][j].isMarked = false;
        gGame.cellMarked = false
        gGame.markedCount--;
    } else {
        gBoard[i][j].isMarked = true;
        elCell.classList.add("marked")
        gGame.cellMarked = true;
        gGame.markedCount++;
    }
    checkVictory()
}

function mouseDown(e, elCell, i, j) {
    e = e || window.event;
    switch (e.which) {
        case 3: cellMarked(elCell, i, j); break;
    }
}


function checkVictory() {
    var countMarkedAndMines = 0;

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && gBoard[i][j].isMarked) {
                countMarkedAndMines++;
            }
        }
    }
    var boardSize = gLevel.SIZE ** 2;
    if (gGame.shownCount === (boardSize - countMarkedAndMines) && countMarkedAndMines === gLevel.MINES) {
        gGame.isOn = false;
        var elSmile = document.querySelector('.smile')
        elSmile.innerHTML = '😎';
        playWinSound()
        clearInterval(gTimer)
        if (gLevel.SIZE === 4) {
            if (localStorage.getItem("easyBestScore") > gGame.secsPassed) {
                localStorage.setItem("easyBestScore", gGame.secsPassed)
                var elHighScore = document.querySelector('.highscoreE');
                elHighScore.innerHTML = 'Easy Best Score: ' + localStorage.getItem("easyBestScore") + ' seconds!';
            }
        } else if (gLevel.SIZE === 8) {
            if (localStorage.getItem("mediumBestScore") > gGame.secsPassed) {
                localStorage.setItem("mediumBestScore", gGame.secsPassed)
                var elHighScoreM = document.querySelector('.highscoreM');
                elHighScoreM.innerHTML = 'Medium Best Score: ' + localStorage.getItem("mediumBestScore") + ' seconds!';
            } else {
                if (localStorage.getItem("extremeBestScore") > gGame.secsPassed) {
                    localStorage.setItem("extremeBestScore", gGame.secsPassed)
                    var elHighScoreM = document.querySelector('.highscoreH');
                    elHighScoreM.innerHTML = 'Extreme Best Score: ' + localStorage.getItem("extremeBestScore") + ' seconds!';
                }
            }
        }
    }
}

function gameOver() {
    var elSmile = document.querySelector('.smile')
    if (gGame.lives === 2) {
        elSmile = document.querySelector('.smile')
        elSmile.innerHTML = '😯';
    }
    if (gGame.lives === 1) {
        revealAll(gBoard)
        gGame.isOn = false;
        elSmile = document.querySelector('.smile')
        elSmile.innerHTML = '😱';
        playGameOverSound()
        clearInterval(gTimer)
        gGame.lives--;
        renderLIVES()
    } else {
        gGame.lives--;
        console.log(gGame.lives)
        renderLIVES()
        playGameOverSound()
    }
}

function revealAll(board) {
    var elCell;
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            gBoard[i][j].isShown = true;
            gBoard[i][j].isMarked = false;
            var classname = getClassName({ i: i, j: j })
            elCell = document.querySelector(`.${classname}`);
            elCell.classList.remove("closed");
            elCell.classList.remove("marked")
        }
    }
}

function expandShown(board, elCell, rowIdx, colIdx) {
    var elNegCell;
    board[rowIdx][colIdx].isShown = true;
    gGame.shownCount++;
    elCell.classList.remove("closed");
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            if (!gBoard[i][j].isMine) {
                if (!board[i][j].isShown) gGame.shownCount++;
                var classname = getClassName({ i: i, j: j })
                board[i][j].isShown = true;
                elNegCell = document.querySelector(`.${classname}`)
                elNegCell.classList.remove("closed")
                board[i][j].isMarked = false;
                if (elNegCell.classList.contains('marked')) {
                    elNegCell.classList.remove('marked')
                    gGame.markedCount--;
                }
            }
        }
    }
}
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}

function getRandomEmptyLocation(board) {
    var empyCells = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isMine) {
                var location = { i: i, j: j }
                empyCells.push(location);
            }
        }
    }
    shuffle(empyCells);
    return empyCells;
}
function easy() {
    gLevel.SIZE = 4;
    gLevel.MINES = 2;
    playClickSound();
    initGame()
}

function medium() {
    gLevel.SIZE = 8;
    gLevel.MINES = 12;
    playClickSound();
    initGame()
}

function extreme() {
    gLevel.SIZE = 12;
    gLevel.MINES = 30;
    playClickSound();
    initGame()
}

function playClickSound() {
    var btnSfx = new Audio('sounds/button push sfx.mp3')
    btnSfx.play()
}

function playGameOverSound() {
    var gameOverSfx = new Audio('sounds/gameover.wav')
    gameOverSfx.play()
}

function playWinSound() {
    var winSfx = new Audio('sounds/win.wav')
    winSfx.play()
}

function setMines(board) {
    var randomEmptyLocations = getRandomEmptyLocation(board);
    for (var i = 0; i < gLevel.MINES; i++) {
        var currLocation = randomEmptyLocations.pop()
        var randomI = currLocation.i;
        var randomJ = currLocation.j;
        board[randomI][randomJ].isMine = true;
    }
    renderBoard(board)
}
