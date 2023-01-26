'use strict'

document.body.style.backgroundImage = "url('img/darkbackground.jpg')";
const MINE = '💣'
const MARKED = '🚩'
const NORMAL = '🙂'
const BOMB = '🤯'
const DEFEAT = '😵'
const VICTORY = '😎'
const LIGHTON = '<img src="img/lighton.png">'
const LIGHTOFF = '<img src="img/lightoff.png">'

const noRightClick = document.querySelector('.board')
noRightClick.addEventListener("contextmenu", e => e.preventDefault());

var gBoard
var elLives
var elFace
var firstMove = true
var gBombTimeout
var gFaceTimeout
var gGame
var cellsNeeded
var isMegaHint = false
var megaHintCells = []
var isHint = false
var usedHint
var safeClicksCount = 3
var elSafeClick = document.querySelector('.addons button span')
var safeCellTimeout
var elHintCell
var isHintOn
var isLightMode = false
var resetSize = 4
var resetMines = 2
var gLevel = {
    size: 4,
    mines: 2
}

function resetBoard(size, mines) {
    firstMove = true
    isHint = false
    safeClicksCount = 3
    elSafeClick.innerText = `${safeClicksCount}`
    isMegaHint = false
    megaHintCells = []
    document.querySelector('.megahint').style.backgroundColor = 'aqua'
    if (usedHint) resetHints()
    gGame = {
        isOn: true,
        lifeCount: 3,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    resetSize = size
    resetMines = mines
    gLevel = {
        size: size,
        mines: mines
    }
    cellsNeeded = ((gLevel.size ** 2) - gLevel.mines)
    onInit()
}

function onInit() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
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
    if (firstMove) {
        randomizeMines(gLevel.mines, i, j)
        renderBoard(gBoard)
        firstMove = false
        revealCell(i, j)
        return
    }
    if (isMegaHint) {
        megaHintCells.push(thisCell)
        if (megaHintCells.length === 2) {
            var cells = useMegaHint(megaHintCells[0], megaHintCells[1])
            // console.log('cells', cells)
            setTimeout(hideAfterMegaHint, 2000, cells)
            document.querySelector('.megahint').style.backgroundColor = 'gray'
            isMegaHint = false
        }
        return
    }
    if (thisCell.isMarked) return
    if (thisCell.isShown) return
    if (isHintOn) {
        clearTimeout(safeCellTimeout)
        console.log('elHintCell', elHintCell)
        elHintCell.style.backgroundColor = 'beige'
        var elHintCellText = elHintCell.querySelector('span')
        console.log('elhintCellText', elHintCellText.innerText)
        if (elHintCellText.innerText === '0') {
            console.log('hi')
            elHintCellText.style.backgroundColor = 'rgb(193, 186, 186)'
            isHintOn = false
        }
    }
    if (isHint) {
        if (thisCell.isShown) return
        var revealed = revealWithHint(i, j)
        setTimeout(hideAfterHint, 1000, i, j, revealed)
        usedHint.innerHTML = LIGHTOFF
        isHint = false
        usedHint.style.display = 'none'
        return
    }

    if (!thisCell.isMine) {
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

function revealWithHint(cellI, cellJ) {
    var revealedCells = []
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        // wont count beyond border(undefined)
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            var thisCell = gBoard[i][j]
            if (thisCell.isShown) revealedCells.push(thisCell)
            elCell.querySelector('span').style.display = 'inline'
            thisCell.isShown = true
            elCell.style.backgroundColor = 'rgb(193, 186, 186)'
            thisCell.minesAroundCount = countNegs(i, j, gBoard)
        }
    }
    return revealedCells
}

function hideAfterHint(cellI, cellJ, revealedCells) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        // wont count beyond border(undefined)
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            var thisCell = gBoard[i][j]
            if (thisCell.isMarked) continue
            elCell.querySelector('span').style.display = 'none'
            thisCell.isShown = false
            elCell.style.backgroundColor = 'rgb(217, 176, 123)'
            for (var k = 0; k < revealedCells.length; k++) {
                if (thisCell.i === revealedCells[k].i && thisCell.j === revealedCells[k].j) {
                    elCell.querySelector('span').style.display = 'inline'
                    thisCell.isShown = true
                    elCell.style.backgroundColor = 'rgb(193, 186, 186)'
                }
            }
        }
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
    if (thisCell.minesAroundCount === 0 && !isMegaHint) {
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

function onSafeClick() {
    isHintOn = true
    if (safeClicksCount === 0) return
    safeClicksCount--
    elSafeClick.innerText = `${safeClicksCount}`
    var cellToReveal = getSafeCell(gBoard)
    elHintCell = document.querySelector(`.cell-${cellToReveal.i}-${cellToReveal.j}`)
    elHintCell.style.backgroundColor = 'rgb(47, 162, 137)'
    safeCellTimeout = setTimeout(() => elHintCell.style.backgroundColor = 'rgb(217, 176, 123)', 2000)
    setTimeout(() => isHintOn = false, 2000)
}

function getSafeCell(board) {
    var currCell = board[getRandomInt(0, board.length)][getRandomInt(0, board.length)]
    if (currCell.isShown) return getSafeCell(board)
    if (currCell.isMine) return getSafeCell(board)
    return currCell
}

function useHint(item) {
    if (isHint && usedHint === item) {
        isHint = false
        item.innerHTML = LIGHTOFF
        return
    }
    if (isHint) {
        item.innerHTML = LIGHTOFF
        return
    }
    usedHint = item
    item.innerHTML = LIGHTON
    isHint = true
}

function resetHints() {
    usedHint.innerHTML = LIGHTOFF
    document.querySelector('.hint1').style.display = 'inline'
    document.querySelector('.hint2').style.display = 'inline'
    document.querySelector('.hint3').style.display = 'inline'
}

function bgcMode() {
    var elBody = document.querySelector('body')
    if (isLightMode === false) {
        document.body.style.backgroundImage = "url('img/lightbackground.jpg')";
        elBody.style.color = 'black'
        // elBody.style.backgroundColor = 'white'
        isLightMode = true
        return
    }
    else {
        document.body.style.backgroundImage = "url('img/darkbackground.jpg')";
        elBody.style.color = 'white'
        // elBody.style.backgroundColor = 'black'
        isLightMode = false
        return
    }
}

function callMegaHint(elButton) {
    if (elButton.style.backgroundColor === 'gray') return console.log('hi')
    if (isMegaHint) {
        isMegaHint = false
        elButton.style.backgroundColor = 'aqua'
        return
    }
    isMegaHint = true
    elButton.style.backgroundColor = 'yellow'
}

function useMegaHint(cell1, cell2) {
    var hintCells = []
    for (var i = cell1.i; i < cell2.i + 1; i++) {
        for (var j = cell1.j; j < cell2.j + 1; j++) {
            var elCell = document.querySelector(`.cell-${i}-${j}`)
            var thisCell = gBoard[i][j]
            console.log('hintCells', hintCells)
            if (thisCell.isShown) continue
            if (thisCell.isMarked) continue
            elCell.querySelector('span').style.display = 'inline'
            thisCell.isShown = true
            elCell.style.backgroundColor = 'rgb(193, 186, 186)'
            thisCell.minesAroundCount = countNegs(i, j, gBoard)
            hintCells.push(thisCell)
        }
    }
    return hintCells
}

function hideAfterMegaHint(megaHintCells) {
    for (var i = 0; i < megaHintCells.length; i++) {
        var elCell = document.querySelector(`.cell-${megaHintCells[i].i}-${megaHintCells[i].j}`)
        var thisCell = gBoard[megaHintCells[i].i][megaHintCells[i].j]
        if (thisCell.isMarked) continue
        elCell.querySelector('span').style.display = 'none'
        thisCell.isShown = false
        elCell.style.backgroundColor = 'rgb(217, 176, 123)'
    }
}



function checkGameOver() {
    if (gGame.lifeCount === 0) {
        var elMines = document.querySelectorAll('.mine span')
        clearTimeout(gBombTimeout)
        revealAllMines(elMines.length, elMines)
        clearTimeout(gFaceTimeout)
        document.querySelector('.face').innerText = `${DEFEAT}`
        console.log('YOU LOSE')
        var elModal = document.querySelector('.modal')
        elModal.style.display = 'block'
        elModal.querySelector('.user-msg').innerText = `YOU LOSE! ${DEFEAT}`
        gGame.isOn = false
    }
    if (gGame.shownCount === cellsNeeded && gGame.markedCount === gLevel.mines) {
        document.querySelector('.face').innerText = `${VICTORY}`
        console.log('YOU WIN')
        var elModal = document.querySelector('.modal')
        elModal.style.display = 'block'
        elModal.querySelector('.user-msg').innerText = `VICTORY! ${VICTORY}`
        gGame.isOn = false
    }
}