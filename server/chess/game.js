import { Chess } from 'chess.js';

export const rooms = {};
export const games = {};

export function createNewGame(roomName, id)
{
    rooms[id] = roomName;
    games[roomName] = {state: new Chess(), first_color: getRandomColor()};
}

export function getState(roomName, color)
{
    let gameState = {
        turn: games[roomName].state.turn(),
        color: color,
        fen: games[roomName].state.fen(),
        pgn: games[roomName].state.pgn(),
        is_checkmate: games[roomName].state.in_checkmate(),
        is_draw: games[roomName].state.in_draw(),
        is_check: games[roomName].state.in_check(),
        is_gameover: games[roomName].state.game_over(),
    };

    return gameState;
}

export function getRandomColor()
{
    let color = Math.random() > 0.5 ? 'w' : 'b';

    return color;
}

export function makeMove(source, target, room, color)
{
    let move = games[room].state.move({
        from: source,
        to: target,
        promotion: 'q'
    });

    let gameState = getState(room, color);
    return {move: move, state: gameState};
}