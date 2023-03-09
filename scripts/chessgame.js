let board
let game = new Chess()
let stockfish
let currentPosition

// engine off/on
let engineOn = false
// field color for black and white
const FIELD_COLOR_WHITE = "#59CBE8"
const FIELD_COLOR_BLACK = "#000000"
const WHITE = "#FFFFFF"

// function onClickField () {
// $(".board-b72b1").on("click", function(e)
// {
//     console.log(e.which)
// })

function onDragStart(source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false

    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }
}

function onDrop(source, target) {
    // see if the move is legal
    let move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })
    // illegal move
    if (move === null) return 'snapback'
 
    // get saved position of last element inside moveoverview
    let lastPosition = $(moveOverview).children().last().attr("data-fen")

    // if last position is defined
    if (!lastPosition) 
    {
        'no snapback'
    }
    else if (currentPosition !== lastPosition)
    {
        console.log('NOT EQUAL')
        return 'snapback'
    }

    updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd() {
    board.position(game.fen())
}

function updateStatus() {
    let status = ''
    let moveColor = 'White'

    if (game.turn() === 'b') {
        moveColor = 'Black'
        $(colorToMove).css("animation-name", "grow")
    }

    // change color of current move graphic
    $(whichColorsTurn).css("background-color", (moveColor == 'White') ? FIELD_COLOR_BLACK : WHITE)
    $(colorToMove).css("background-color", (moveColor == 'White') ? WHITE : FIELD_COLOR_BLACK)

    // checkmate?
    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.'
    }

    // draw?
    else if (game.in_draw()) {
        status = 'Game over, drawn position'
    }

    // game still on
    else {
        status = moveColor + ' to move'

        // check?
        if (game.in_check()) {
            let kingInCheck = (moveColor === 'White') ? $('[data-piece="wK"]')[0] : $('[data-piece="bK"]')[0]
            $(kingInCheck).addClass("kingInCheck::after")
        }
    }

    currentPosition = game.fen()

    // insert move into the moveoverview
    let listMoves = game.history();
    let lastMove = listMoves.pop()
    let div = document.createElement("div")
    let divCounter = document.createElement("div")

    // save current position in dataattribute
    $(div).attr("data-fen", currentPosition)
    // insert move into div
    $(div).text(lastMove);

    if (lastMove != null) {
        // display played move
        let text
        // if move is black, add counter
        if (moveColor === 'Black') {
            $(moveOverview).append(divCounter);
            $(moveOverview).append(div);
            divCounter.innerHTML = "."
            $(divCounter).addClass("incrementMoveCounter");
            $(playedMove).addClass('incrementMoveCounter')
            text = ".  " + lastMove
        }
        // if move is white, remove counter
        else {
            $(playedMove).removeClass('incrementMoveCounter')
            $(moveOverview).append(div);
            text = "..." + lastMove;
        }

        // insert current move
        $(playedMove).html(text)

        //moveOverview auto-scroll
        $(moveOverview).scrollTop($(moveOverview).height())


    }
    
    // update Stockfish if engine is on
    engineOn ? updateStockfish() : null
}

let config = {
    showNotation: true,
    draggable: true,
    dropOffBoard: 'trash',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    onChange: onChange,
    pieceTheme: 'pieces/{piece}.svg',
    sparePieces: false,
    position: 'start',
}

board = Chessboard('board', config)

//enable resizing
$(window).on("resize", board.resize);

//removing border of the Board
$('.board-b72b1').addClass("noBorder")


// customize board
onChange()

//customize again, if window resized
window.addEventListener("resize", function () {
    onChange()
});

function onChange() {
    //change colors of board
    changeBoardTheme()
    // change bar height to board height
    fitBarToBoard()
    //customize notation and check if notation is set in CONFIG
    if (config.showNotation)
        customizeNotation();
}

function changeBoardTheme() {
    // selecting all fields of the board
    let allFields = $('.square-55d63');
    // foreach loop on allFields and log class name of element
    $.each(allFields, function (i, field) {
        let selector = $(field)
        let identifier = selector.attr("class");
        // change field colors of black and white
        identifier.includes("white") ? selector.addClass("whiteField") : selector.addClass("blackField")

        // round corners of the board
        identifier.includes("a8") ? selector.addClass("a8") : null
        identifier.includes("a1") ? selector.addClass("a1") : null
        identifier.includes("h8") ? selector.addClass("h8") : null
        identifier.includes("h1") ? selector.addClass("h1") : null
    });


}

// set height of engine bar to height of chessboard
function fitBarToBoard() {
    let chessboardHeight = getComputedStyle(document.querySelector('.chessboard-63f37')).height;
    engineBar.style.height = `${chessboardHeight}`;
}

// set font-family, font-size, color and font-weight of notation
function customizeNotation() {
    $(".notation-322f9").each(function () {
        $(this).addClass("customNotation")
    })
}

$(startPosition).on("click", function () {
    // reset board
    board.start()
    //reset game
    game.reset()
    // reset move overview
    $(moveOverview).empty()
    // reset move counter
    $(playedMove).removeClass("incrementMoveCounter").empty()
    // stop animation
    $(colorToMove).css("animation-name", "none")
    updateStatus()
});

$(document).on('keydown', function (e) {
    // if user presses F
    if (e.which == 70) {
        //change board orientation
        board.flip()
        // customize board again
        onChange()
    }
})

$(flipOrientation).on("click", function () {
    //change board orientation
    board.flip()
    // customize board again
    onChange()

})

// move to start position
$(moveVeryFirst).on("click", function () {
    // set board to start position
    board.start()
    // reset game
    game.reset()
    // update status
    updateStatus()
})


// move to previous position
$(moveBefore).on("click", function () {
    // find element with data-fen attribute that matches the current position
    let currentFen = $(`[data-fen="${currentPosition}"]`)
    // get previous element
    let previousElement = $(currentFen).prev()
    // check if previous element has data-fen attribute
    if (!$(previousElement).attr('data-fen')) {
        // get previous element of previous element
        previousElement = $(previousElement).prev()
        // check if previous element of previous element has data-fen attribute
        if (!$(previousElement).attr('data-fen')) {
            // set board to start position
            board.start()
            // reset game
            game.reset()
            // update status
            updateStatus()
            return
        }
    }

    let previousPos = $(previousElement).attr('data-fen')
    // board loads fen
    board.position(previousPos)
    // game loads fen
    game.load(previousPos)
    // update status
    updateStatus()

})

// move to next position
$(moveNext).on("click", function () {
    // find element with data-fen attribute that matches the current position
    let currentFen = $(`[data-fen="${currentPosition}"]`)
    let nextElement, nextPosition

    if (currentFen.length ===  1) {
        // get next element
        nextElement = $(currentFen).next()

        // check if next element is defined
        if ($(nextElement).length === 0) {
            return
        }
        else if (!$(nextElement).attr('data-fen')) {
            // get next element of next element
            nextElement = $(nextElement).next()
        }
        nextPosition = $(nextElement).attr('data-fen')
    }
    else 
    {
        // get second child, because first child is always the move number
        let secChild = $(moveOverview).children()[1]
        nextPosition = $(secChild).attr('data-fen')

    }
    // board loads fen
    board.position(nextPosition)
    // game loads fen
    game.load(nextPosition)
    // update status
    updateStatus()
})

//move to last position
$(moveVeryLast).on("click", function () {
    // get last position of move overview
    let lastPosition = $(moveOverview).children().last().attr('data-fen')
    // if last position is defined
    if (lastPosition) {
        // board loads fen
        board.position(lastPosition)
        // game loads fen
        game.load(lastPosition)
        // update status
        updateStatus()
    }
    // there is no last position
    else {
        return
    }
})

// import fen
$(importBTN).on("click", function () {
    let fen = fenInput.value
    if (game.validate_fen(fen).valid) {
        // remove overlay
        $(importExportGame).addClass('REMOVE')
        $(overlaySettingsContainer).addClass('REMOVE')
        // load fen into board
        board.position(fen)
        // load fen into game
        game.load(fen)
        // update status
        updateStatus()
        // reset move overview
        $(moveOverview).empty()
    }
    else {
        alert("Invalid FEN")
        return
    }
    return true
})

// export fen
$(exportBTN).on("click", function () {
    // get fen from board
    let fen = currentPosition
    // set fen in input
    fenOutput.value = fen
})


// Turn on/off Engine
$(engineToggle).on("change", function () {
    // if input is checked turn on engine
    $(engineToggle).prop('checked') == true ? initalizeStockfish() : shutDownStockfish()

})

// Turn on engine
function initalizeStockfish() {
    // initialize stockfish via web worker
    stockfish = new Worker("stockfish.js-Stockfish11/src/stockfish.js")
    // set engineOn to true
    engineOn = true
    // update engine
    updateStockfish()
}

// Update engine input
function updateStockfish() {

    // empty best moves and evaluation
    $(bestMoves).empty()
    $(currentAdvantage).empty()

    // send position to engine
    stockfish.postMessage("position fen " + currentPosition)
    stockfish.postMessage("setoption name MultiPV value 5")
    // determine depth setting
    let depth = $(depthRangeSlider).val()
    // set depth calculation
    stockfish.postMessage("go depth " + depth);
    // display current depth setting
    $(stockfishDepth).text("Tiefe " + depth)
    // get evaluation of current position
    stockfish.postMessage("eval");

    // filter output
    stockfish.onmessage = function(event) {
        //NOTE: Web Workers wrap the response in an object.

        // insert evaluation into dom
         if(event.data.startsWith("Total evaluation")) {
            let output = event.data.split(" ")
            let evaluation = "+ " + output[2]
            let div = $("<h1></h1>").text(evaluation)
            $(currentAdvantage).append(div)
        }
        // insert bestmove into dom
         if (event.data.startsWith("bestmove")) {
            let output = event.data.split(" ")
            let bestMove = output[1]
            let div = $("<div></div>").text("1. " + bestMove)
            $(bestMoves).append(div)
        }
        console.log(event.data)
    }
    
}

// Turn off engine
function shutDownStockfish () {

    // shut down stockfish
    if (stockfish !== undefined) 
    {
        stockfish.postMessage("stop")
        stockfish.postMessage("quit")
        // terminate the worker
        stockfish.terminate()
        // set Engineon to false
        engineOn = false
        // empty output display
        $(bestMoves).empty()
        $(currentAdvantage).empty()
    }
}




updateStatus()
