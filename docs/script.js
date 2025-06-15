let game, board;
let playerColor = 'w';
let book = {};

function handleOnDragStart(source, piece) {
    if (
        game.game_over() ||
        (game.turn() === 'w' && playerColor !== 'w') ||
        (game.turn() === 'b' && playerColor !== 'b') ||
        (game.turn() === 'w' && piece.startsWith('b')) ||
        (game.turn() === 'b' && piece.startsWith('w'))
    ) {
        return false;
    }
}

function handleOnDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (!move) return 'snapback';
    update();

    if (game.turn() !== playerColor && !game.game_over()) {
        setTimeout(makeComputerMove, 200);
    }
}

function handleOnSnapEnd() {
    board.position(game.fen());
}

function handleResetClick() {
    board.destroy();
    initGame();
}

function mirrorPiecing(str) {
    return str.split('').map(char =>
        char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
    ).join('');
}

function mirrorSquaring(input) {
    const flipMap = { '1': '8', '2': '7', '3': '6', '4': '5', '5': '4', '6': '3', '7': '2', '8': '1' };
    return input.split('').map(char => flipMap[char] || char).join('');
}

function makeFENOriginal(fen) {
    const parts = fen.trim().split(' ');
    if (parts.length !== 6) throwFENError();
    parts[4] = '0';
    parts[5] = '1';
    return parts.join(' ');
}

function makeSortedStr(str) {
    return str.split('').sort().join('');
}

function makeFENWhite(fen) {
    if (typeof fen !== 'string') throwFENError();
    let parts = fen.trim().split(' ');
    if (parts.length !== 6) throwFENError();
    if (parts[1] === 'w') return makeFENOriginal(parts.join(' '));
    parts[1] = 'w';
    parts[0] = mirrorPiecing(parts[0]).split('/').reverse().join('/');
    parts[2] = makeSortedStr(mirrorPiecing(parts[2]));
    if (parts[3].length === 2) parts[3] = mirrorSquaring(parts[3]);
    parts[4] = '0';
    parts[5] = '1';
    return parts.join(' ');
}

function isWhitesTurn(fen) {
    if (typeof fen !== 'string') throwFENError();
    const parts = fen.trim().split(' ');
    return parts[1] === 'w';
}

function throwFENError() {
    throw new Error('Invalid FEN: must contain 6 space-separated fields.');
}

function makeMsg(game) {
    const turn = game.turn() === 'w' ? 'White' : 'Black';
    if (game.in_checkmate()) return `Checkmate – ${turn} loses.`;
    if (game.in_draw()) return "Draw!";
    return `${turn} to move${game.in_check() ? ' (in check!)' : ''}`;
}

function update() {
    document.getElementById('status').textContent = makeMsg(game);
    document.getElementById('fen').textContent = `FEN: ${game.fen()}`;
    document.getElementById('pgn').textContent = `PGN: ${game.pgn()}`;
}

function makeComputerMove() {
    const rawFen = game.fen();
    const whiteFen = makeFENWhite(rawFen);
    const moves = book[whiteFen];

    if (!moves || moves.length === 0) {
        const loser = game.turn() === 'w' ? 'White' : 'Black';
        document.getElementById('status').textContent = `Computer resigns – ${loser} loses.`;
        return;
    }

    const moveStr = moves[Math.floor(Math.random() * moves.length)];

    if (playerColor === 'w') {
        game.move(moveStr);
    } else {
        const from = mirrorSquaring(moveStr.slice(0, 2));
        const to = mirrorSquaring(moveStr.slice(2, 4));
        game.move({ from, to, promotion: 'q' });
    }

    board.position(game.fen());
    update();
}

async function main() {
    book = await fetch('/cfg.json').then(res => res.json());
    initGame();
}

function initGame() {
    game = new Chess();
    playerColor = Math.random() < 0.5 ? 'w' : 'b';

    board = Chessboard('board', {
        draggable: true,
        position: 'start',
        pieceTheme: '/img/pieces/{piece}.png',
        orientation: playerColor === 'w' ? 'white' : 'black',
        onDragStart: handleOnDragStart,
        onDrop: handleOnDrop,
        onSnapEnd: handleOnSnapEnd
    });

    document.getElementById('reset').onclick = handleResetClick;
    update();

    if (game.turn() !== playerColor) {
        setTimeout(makeComputerMove, 200);
    }
}

main();
