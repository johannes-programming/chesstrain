
const game = new Chess();
const statusEl = document.getElementById('status');

function updateStatus() {
    const turn = game.turn() === 'w' ? 'White' : 'Black';
    let msg;
    if (game.in_checkmate()) msg = `Checkmate – ${turn} loses.`;
    else if (game.in_draw()) msg = "Draw!";
    else msg = `${turn} to move${game.in_check() ? ' (in check!)' : ''}`;
    statusEl.textContent = msg;
}

const board = Chessboard('board', {
    draggable: true,
    position: 'start',
    pieceTheme: '/img/pieces/{piece}.png',
    onDragStart: (src, piece) => {
    if (
        game.game_over() ||
        (game.turn() === 'w' && piece.startsWith('b')) ||
        (game.turn() === 'b' && piece.startsWith('w'))
    ) return false;
    },
    onDrop: (src, dst) => {
    const move = game.move({ from: src, to: dst, promotion: 'q' });
    if (!move) return 'snapback';
    updateStatus();
    },
    onSnapEnd: () => board.position(game.fen())
});

updateStatus();