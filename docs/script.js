let game, board;

function updateStatus() {
    const statusEl = document.getElementById('status');
    const fenEl = document.getElementById('fen');
    const turn = game.turn() === 'w' ? 'White' : 'Black';
    let msg;

    if (game.in_checkmate()) msg = `Checkmate – ${turn} loses.`;
    else if (game.in_draw()) msg = "Draw!";
    else msg = `${turn} to move${game.in_check() ? ' (in check!)' : ''}`;

    statusEl.textContent = msg;
    fenEl.textContent = `FEN: ${game.fen()}`;
}

function handleDragStart(source, piece, position, orientation) {
    if (
        game.game_over() ||
        (game.turn() === 'w' && piece.startsWith('b')) ||
        (game.turn() === 'b' && piece.startsWith('w'))
    ) {
        return false;
    }
}

function handleDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (!move) return 'snapback';
    updateStatus();
}

function handleSnapEnd() {
    board.position(game.fen());
}

function handleResetClick() {
    game.reset();
    board.start();
    updateStatus();
}

function main() {
    game = new Chess();

    board = Chessboard('board', {
        draggable: true,
        position: 'start',
        pieceTheme: '/img/pieces/{piece}.png',
        onDragStart: handleDragStart,
        onDrop: handleDrop,
        onSnapEnd: handleSnapEnd
    });

    document
        .getElementById('resetBtn')
        .addEventListener('click', handleResetClick);

    updateStatus();
}

// 👇 Start the app
main();
