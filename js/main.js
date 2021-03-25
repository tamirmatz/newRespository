const MINE = '💣'
const EMPTY = ' ';

var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gTimer;

function initGame() {
    var elSmile = document.querySelector('.smile')
    elSmile.innerHTML = '🤠';
    gGame.shownCount = 0;
    gGame.secsPassed = 0;
    gGame.isOn = true;
    clearInterval(gTimer)
    gBoard = buildBoard()
    renderBoard(gBoard);
}

function start(){
    gTimer = setInterval(updateTime, 1000)
}

function updateTime(){
    gGame.secsPassed += 1;
    renderTime();
}

function renderTime(){
    var elTime = document.querySelector('.timer')
    elTime.innerHTML = 'Seconds Passed: ' + gGame.secsPassed;
}

//disable menu on rifht click
window.addEventListener("contextmenu", e => e.preventDefault());

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

            if (currCell.isMarked) strHTML += MARKED;

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;

}


function cellClicked(elCell, i, j) {
    if(gGame.shownCount === 0) start()
    if (gBoard[i][j].isShown) return
    if (gBoard[i][j].isMarked) return
    playClickSound()
    if (gBoard[i][j].minesAroundCount > 0) {
        gBoard[i][j].isShown = true;
        elCell.classList.remove("closed")
        gGame.shownCount++;
    }
    if (!gBoard[i][j].isMine && gBoard[i][j].minesAroundCount === 0) {
        expandShown(gBoard, elCell, i, j)
    }
    if (gBoard[i][j].isMine) gameOver()
    console.log(gGame)
    checkVictory()

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
        console.log("you win")
        playWinSound()
        clearInterval(gTimer)
    }
}

function gameOver() {
    revealAll(gBoard)
    gGame.isOn = false;
    console.log('you lose')
    var elSmile = document.querySelector('.smile')
    elSmile.innerHTML = '😱';
    playGameOverSound()
    clearInterval(gTimer)
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
                if(!board[i][j].isShown) gGame.shownCount++;
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
function easy(){
    gLevel.SIZE = 4;
    gLevel.MINES = 2;
    playClickSound();
    initGame()
}

function medium(){
    gLevel.SIZE = 8;
    gLevel.MINES = 12;
    playClickSound();
    initGame()
}

function extreme(){
    gLevel.SIZE = 12;
    gLevel.MINES = 30;
    playClickSound();
    initGame()
}

function playClickSound(){
    var btnSfx = new Audio('sounds/button push sfx.mp3')
    btnSfx.play()
}

function playGameOverSound(){
    var gameOverSfx = new Audio('sounds/gameover.wav')
   gameOverSfx.play()
}

function playWinSound(){
    var winSfx = new Audio('sounds/win.wav')
   winSfx.play()
}