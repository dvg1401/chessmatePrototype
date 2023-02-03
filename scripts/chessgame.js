let board = null
let game = new Chess()

// field color for black and white
const FIELD_COLOR_WHITE = "#59CBE8"
const FIELD_COLOR_BLACK = "#000000"

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
    $(whichColorsTurn).css("background-color", (moveColor == 'White') ? FIELD_COLOR_BLACK : FIELD_COLOR_WHITE)
    $(colorToMove).css("background-color", (moveColor == 'White') ? FIELD_COLOR_WHITE : FIELD_COLOR_BLACK)

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
            console.log('King: ',$("[data-piece=bK]"))
            let kingInCheck = (moveColor === 'White') ? $('[data-piece="wK"]')[0] : $('[data-piece="bK"]')[0]
            $(kingInCheck).addClass("kingInCheck")
        }
    }

    //   $status.html(status)
    $currentPosition  = game.fen()
    //   $pgn.html(game.pgn())

    // insert move into the moveoverview
    let listMoves = game.history();
    let lastMove = listMoves.pop()
    let div = document.createElement("div")
    let divCounter = document.createElement("div")

    // insert move into div
    $(div).text(lastMove);

    if (lastMove != null) {
        if(listMoves.length % 2 === 0)
        {
            $(moveOverview).append(divCounter);
            $(moveOverview).append(div);
            divCounter.innerHTML = "."
            $(divCounter).addClass("incrementMoveCounter");
        }
        else {
            $(moveOverview).append(div);
        }
        // increase rows auf grid container
        cutInHalf = Math.ceil(listMoves.length / 2);
        // prevent rows become null
        let increaseRows = (cutInHalf != 0) ? cutInHalf : 1;
        $(moveOverview).css("grid-template-rows",`repeat(${increaseRows},10%)`)

        // display played move
        let text
        if (moveColor === 'Black')
        {
            $(playedMove).addClass('incrementMoveCounter')
            text = ".  " + lastMove
        } 
        else
        {
            $(playedMove).removeClass('incrementMoveCounter')
            text = "..." + lastMove;
        }
       
        $(playedMove).html(text)
    }
}

let config = {
    showNotation: true,
    draggable: true,
    dropOffBoard: 'trash',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    // onChange: onChange,
    pieceTheme: 'pieces/{piece}.svg',
    sparePieces: false,
    position: 'start',
}

board = Chessboard('board', config)

//enable resizing
$(window).on("resize", board.resize);

//removing border of the Board
const BOARD_STYLES = document.querySelector('.board-b72b1');
BOARD_STYLES.style.border = "1px solid #11111F";

//customize notation and check if notation is set in CONFIG
if (config.showNotation)
    customizeNotation();

//change colors of board
changeBoardTheme();

// change bar height to board height
fitBarToBoard();

//customize again, if window resized
window.addEventListener("resize", function () {
    // change board theme again
    changeBoardTheme();
    // fit bar to board again
    fitBarToBoard();
    // customize notation
    if (config.showNotation)
        customizeNotation();
});

function changeBoardTheme() {
    // selecting all fields of the board
    let allFields = document.querySelectorAll('.square-55d63');
    allFields.forEach(field => {
        // remove Border
        field.style.border = "none !important";

        // separate black and white fields
        let identfier = field.attributes[0].nodeValue;
        if (identfier.includes("white"))
            field.style.backgroundColor = FIELD_COLOR_WHITE;
        else
            field.style.backgroundColor = FIELD_COLOR_BLACK;
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
        this.style.fontFamily = "Inika, serif";
        this.style.fontSize = "clamp(0.25rem,1.25vw,1rem)";
        this.style.fontWeight = "bold";
        this.style.color = "#D9D9D9";
    })
}


$(startPosition).on("click", board.start);
$(startPosition).on("click", function()
{
    game.reset();
    $(moveOverview).empty()
    updateStatus()
    $(playedMove).removeClass("incrementMoveCounter").empty()
});

$(flipOrientation).on("click", board.flip)
$(flipOrientation).on("click", function()
{
    // change board theme again
    changeBoardTheme();
    // fit bar to board again
    fitBarToBoard();
    // customize notation
    if (config.showNotation)
        customizeNotation();
})

// $(moveBefore).on("click", function()
// {

//     game.undo();
// })

$(importBTN).on("click", function()
{
    let fen = fenInput.value
    board.position(fen)
    game.reset()
    game.load(fen)
    $(moveOverview).empty()
    importExportGame.classList.add('REMOVE')
    overlaySettingsContainer.classList.add('REMOVE')
})


updateStatus()

// function onChange() use for style methods
// {
// }