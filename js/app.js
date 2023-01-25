'use strict'

const MINE = '💣'
const MARKED = '🚩'
const NORMAL = '🙂'
const BOMB = '🤯'
const DEFEAT = '😵'
const VICTORY = '😎'

const noRightClick = document.querySelector('.board')
noRightClick.addEventListener("contextmenu", e => e.preventDefault());

var gBoard
// var cell = {
//     minesAroundCount: 4,
//     isShown: false,
//     isMine: false,
//     isMarked: true
// }
var elLives
var elFace
var firstMove = true
var gBombTimeout
var gFaceTimeout
var gGame
var cellsNeeded
var gLevel = {
    size: 4,
    mines: 2
}

function resetBoard(size, mines) {
    firstMove = true
    gGame = {
        isOn: true,
        lifeCount: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gLevel = {
        size: size,
        mines: mines
    }
    cellsNeeded = ((gLevel.size ** 2) - gLevel.mines)
    onInit()
}

function onInit() {
    gGame = {
        isOn: true,
        lifeCount: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    elLives = document.querySelector('.lives').innerText = `lives: ${gGame.lifeCount}`
    elFace = document.querySelector('.face').innerText = `${NORMAL}`
    cellsNeeded = ((gLevel.size ** 2) - gLevel.mines)
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
}

function onCellClicked(i, j) {
    if (!gGame.isOn) return
    var elCell = document.querySelector(`.cell-${i}-${j}`)
    var thisCell = gBoard[i][j]
    if (thisCell.isMarked) return
    if (firstMove) {
        randomizeMines(gLevel.mines, i, j)
        renderBoard(gBoard)
        firstMove = false
        revealCell(i, j)
        return
    }
    if (!thisCell.isMine) {
        if (thisCell.isShown) return
        revealCell(i, j)
        return
    }
    if (thisCell.isMine) {
        elCell.querySelector('span').style.display = 'inline'
        gBombTimeout = setTimeout(() => elCell.querySelector('span').style.display = 'none', 1000)
        document.querySelector('.face').innerText = `${BOMB}`
        gFaceTimeout = setTimeout(() => document.querySelector('.face').innerText = `${NORMAL}`, 1000)
        gGame.lifeCount--
        elLives = document.querySelector('.lives').innerText = `lives: ${gGame.lifeCount}`
        checkGameOver()
    }
}

function revealCell(i, j) {
    var elCell = document.querySelector(`.cell-${i}-${j}`)
    var thisCell = gBoard[i][j]
    elCell.querySelector('span').style.display = 'inline'
    thisCell.isShown = true
    gGame.shownCount++
    elCell.style.backgroundColor = 'rgb(193, 186, 186)'
    thisCell.minesAroundCount = countNegs(i, j, gBoard)
    if (thisCell.minesAroundCount === 0) {
        revealNeighbors(i, j, gBoard)
    }
    checkGameOver()
}

function revealNeighbors(cellI, cellJ, mat) {
    // looping through 8 cells of specified cell
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        // wont count beyond border(undefined)
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            //wont count chosen cell
            if (i === cellI && j === cellJ && !firstMove) continue
            if (j < 0 || j >= mat[i].length) continue
            if (gBoard[i][j].isMine) continue
            onCellClicked(i, j)
        }
    }
}

function revealAllMines(amount, elMines) {
    for (var i = 0; i < amount; i++) {
        elMines[i].style.display = 'inline'
    }
}

function onCellMarked(i, j) {
    if (!gGame.isOn) return
    var elCell = document.querySelector(`.cell-${i}-${j}`)
    var elSpan = elCell.querySelector('span')
    var thisCell = gBoard[i][j]
    if (thisCell.isShown) return
    if (thisCell.isMarked) {
        thisCell.isMarked = false
        gGame.markedCount--
        elSpan.innerText = `${countNegs(i, j, gBoard)}`
        elSpan.style.display = 'none'
        return
    }
    else (!thisCell.isMarked)
    thisCell.isMarked = true
    gGame.markedCount++
    elSpan.innerText = MARKED
    elSpan.style.display = 'inline'
    checkGameOver()
}

//FIRST MOVE MINES
function randomizeMines(numOfMines, firstI, firstJ) {
    for (var i = 0; i < numOfMines; i++) {
        var bombCell = getRandomCell(gBoard)
        if (bombCell.i === firstI && bombCell.j === firstJ) {
            bombCell = getRandomCell(gBoard)
            bombCell.isMine = false
            i--
        } else
            bombCell.isMine = true
    }
    renderBoard(gBoard)
}

function getRandomCell(board) {
    var currCell = board[getRandomInt(0, board.length)][getRandomInt(0, board.length)]
    if (currCell.isMine) {
        return getRandomCell(board)
    }
    return currCell
}

function checkGameOver() {
    if (gGame.lifeCount === 0) {
        var elMines = document.querySelectorAll('.mine span')
        clearTimeout(gBombTimeout)
        revealAllMines(elMines.length, elMines)
        clearTimeout(gFaceTimeout)
        document.querySelector('.face').innerText = `${DEFEAT}`
        console.log('YOU LOSE')
        gGame.isOn = false
    }
    if (gGame.shownCount === cellsNeeded && gGame.markedCount === gLevel.mines) {
        document.querySelector('.face').innerText = `${VICTORY}`
        console.log('YOU WIN')
        gGame.isOn = false
    }
}