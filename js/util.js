function countNegs(cellI, cellJ, mat) {
    // if we want to count negs
    var negsCount = 0
    // looping through 8 cells of specified cell
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        // wont count beyond border(undefined)
        if (i < 0 || i >= mat.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            //wont count chosen cell
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue

            if (mat[i][j].isMine) negsCount++
        }
    }
    return negsCount
}

function timer() {
    // set var gTimerInterval and html element (div or span) with timer class to start
    var timer = document.querySelector('.timer')
    var start = Date.now()
    gTimerInterval = setInterval(function () {
        var currTs = Date.now()
        var secs = parseInt((currTs - start) / 1000)
        var ms = (currTs - start) - secs * 1000
        ms = '000' + ms
        // mlSeconds length
        ms = ms.substring(ms.length - 3, ms.length)
        //Rendering 
        timer.innerText = `\n ${secs}:${ms}`
    }, 100)
}

function buildBoard(size) {
    var board = []
    for (var i = 0; i < size; i++) {
        board.push([])
        for (var j = 0; j < size; j++) {
            board[i][j] = { i: i, j: j, isShown: false, isMarked: false, isMine: false, minesAroundCount: 0 }
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j }) + ' '
            if (currCell.isMine) cellClass += 'mine'
            if (currCell.isMine) {
                strHTML += `<td class="cell ${cellClass}"  onclick="onCellClicked(${i},${j})" oncontextmenu="onCellMarked(${i},${j})"><span style="display:none">${MINE}</span>`
            }
            else {
                strHTML += `<td class="cell ${cellClass}"  onclick="onCellClicked(${i},${j})" oncontextmenu="onCellMarked(${i},${j})"><span style="display:none">${countNegs(i, j, gBoard)}</span>`
            }
            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}