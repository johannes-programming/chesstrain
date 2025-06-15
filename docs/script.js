let game, board, human, book;


// handle functions
function handleUndoClick() {
    const move = game.undo(); // undo last move
    if (move) {
        board.position(game.fen()); // update board position
        update(); // update status, FEN, PGN
    }
}
function handleFlipClick() {
    board.flip();
}
function handleOnDragStart(source, piece, position, orientation) {
    if (
        game.game_over() ||
        (game.turn() === 'w' && piece.startsWith('b')) ||
        (game.turn() === 'b' && piece.startsWith('w'))
    ) {
        return false;
    }
}

function handleOnDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (!move) {return 'snapback';}
    update();
}

function handleOnSnapEnd() {
    board.position(game.fen());
}

function handleResetClick() {
    game.reset();
    board.start();
    update();
}

// mirror functions
function mirrorPiecing(str) {
  return str
    .split('')
    .map(char =>
      char === char.toUpperCase()
        ? char.toLowerCase()
        : char.toUpperCase()
    )
    .join('');
}
function mirrorSquaring(input) {
    const flipMap = {
        '1': '8',
        '2': '7',
        '3': '6',
        '4': '5',
        '5': '4',
        '6': '3',
        '7': '2',
        '8': '1',
    };

    return input
        .split('')
        .map(char => flipMap[char] || char)
        .join('');
}


// make functions
function makeMsg(game){
    const turn = game.turn() === 'w' ? 'White' : 'Black';
    let msg;

    if (game.in_checkmate()) {
        msg = `Checkmate – ${turn} loses.`;
    } else if (game.in_draw()) {
        msg = "Draw!";
    } else { 
        msg = `${turn} to move${game.in_check() ? ' (in check!)' : ''}`;
    }
    return msg;
}


function makeFENOriginal(fen) {
    const parts = fen.trim().split(' ');

    if (parts.length !== 6) {
        throwFENError();
    }

    // Replace halfmove clock and fullmove number
    parts[4] = '0'; // halfmove clock
    parts[5] = '1'; // fullmove number

    return parts.join(' ');
}
function makeSortedStr(str) {
  return str.split('').sort().join('');
}
function makeFENWhite(fen) {
    if (typeof fen !== 'string') {throwFENError();}
    let parts = fen.trim().split(' ');
    if (parts.length !== 6) {throwFENError();}
    if (parts[1] === 'w') {
        return parts.join(' ');
    } else {
        parts[1] = "w";
    }
    parts[0] = mirrorPiecing(parts[0]).split('/').reverse().join("/");
    parts[2] = makeSortedStr(mirrorPiecing(parts[2]));
    if (parts[3].length === 2){
        parts[3] = mirrorSquaring(parts[3]);
    }
    return parts.join(' ');
}


// boolean functions
function isWhitesTurn(fen) {
    if (typeof fen !== 'string') {throwFENError();}
    const parts = fen.trim().split(' ');
    return parts[1] === 'w';
}

// error functions
function throwFENError() {
    throw new Error('Invalid FEN: must contain 6 space-separated fields.');
}



// core functions

function update() {
    const statusEl = document.getElementById('status');
    const fenEl = document.getElementById('fen');
    const pgnEl = document.getElementById('pgn');


    statusEl.textContent = makeMsg(game);
    fenEl.textContent = `FEN: ${game.fen()}`;
    pgnEl.textContent = `PGN: ${game.pgn()}`;
}

function main() {
    game = new Chess();

    board = Chessboard('board', {
        draggable: true,
        position: 'start',
        pieceTheme: '/img/pieces/{piece}.png',
        onDragStart: handleOnDragStart,
        onDrop: handleOnDrop,
        onSnapEnd: handleOnSnapEnd
    });

    document
        .getElementById('reset')
        .addEventListener('click', handleResetClick);
    document
        .getElementById('takeback')
        .addEventListener('click', handleUndoClick);
    document
        .getElementById('mirror')
        .addEventListener('click', handleFlipClick);



    update();
}

// 👇 Start the app
main();
