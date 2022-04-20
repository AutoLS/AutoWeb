const socket = io(`https://${window.location.hostname}:3000`);

//Global data
const urlData = Qs.parse(location.search, {ignoreQueryPrefix: true});
let gameCode;

//Dom objects
const lobbyDiv = document.querySelector('#lobby-screen');
const gameScreen = document.querySelector('#game-screen');
const welcomeHeader = document.querySelector('#welcome-message');
const createGameButton = document.querySelector('#create-new-game');
const gameCodeInput = document.querySelector('#game-code-input');
const joinGameButton = document.querySelector('#join-game');
const drawMessageModal = new bootstrap.Modal(document.querySelector('#draw-message-box'), {
    keyboard: false
});
const resignMessageModal = 
new bootstrap.Modal(document.querySelector('#resign-message-box'), {
    keyboard: false
});
const rematchMessageModal = 
new bootstrap.Modal(document.querySelector('#rematch-message-box'), {
    keyboard: false
});
const resignButton = document.querySelector('#resign-button');
const drawButton = document.querySelector('#draw-button');
const rematchButton = document.querySelector('#rematch-button');
const $status = $('#status');
const $fen = $('#fen');
const $pgn = $('#pgn');

//Update html
welcomeHeader.innerHTML = `Welcome to chess beta, ${urlData.username}!`;

function validUsername()
{
    if(urlData.username === undefined)
    {
        location.href = `https://${window.location.hostname}/apps/chess/index.html`;
    }
}

validUsername();

createGameButton.addEventListener('click', () => {
    lobbyDiv.style.display = 'none';
    gameScreen.style.display = 'block';
    socket.emit('new_game', urlData.username);
});

joinGameButton.addEventListener('click', () => {
    gameCode = gameCodeInput.value;
    socket.emit('join_game', urlData.username, gameCode);
});

resignButton.addEventListener('click', () => {
    resignMessageModal.show();
});

drawButton.addEventListener('click', () => {
    socket.emit('draw_request', urlData.username, gameCode);
    writeLog('You initiated a draw request.');
});

rematchButton.addEventListener('click', () => {
    socket.emit('rematch_request', urlData.username);
    writeLog('You initiated a rematch request.');
});

document.querySelector('#decline-resign-button').addEventListener('click', () => {
    resignMessageModal.hide();
});

document.querySelector('#accept-resign-button').addEventListener('click', () => {
    socket.emit('resign', urlData.username, game.color);
    writeLog('You resigned, resetting game.');
    resignMessageModal.hide();
});

document.querySelector('#decline-draw-button').addEventListener('click', () => {
    socket.emit('decline_draw', urlData.username);
    writeLog('You declined the draw request.');
    drawMessageModal.hide();
});

document.querySelector('#accept-draw-button').addEventListener('click', () => {
    socket.emit('accept_draw', urlData.username, game.color);
    writeLog('You accepted the draw request. Resetting game.');
    drawMessageModal.hide();
});

document.querySelector('#decline-rematch-button').addEventListener('click', () => {
    socket.emit('decline_rematch', urlData.username);
    writeLog('You declined the rematch request.');
    rematchMessageModal.hide();
});

document.querySelector('#accept-rematch-button').addEventListener('click', () => {
    socket.emit('accept_rematch', urlData.username, game.color);
    writeLog('You accepted the rematch request, resetting game.');
    rematchMessageModal.hide();
});

socket.on('show_game_code', (room) => {
    document.querySelector('#game-code-display').innerHTML = `Game code: ${room}`;
    gameCode = room;
});

//Handle chat
const writeLog = (text) => 
{
    const parentUL = document.querySelector('#chat-log');
    const childLi = document.createElement('li');
    childLi.innerHTML = text;

    parentUL.appendChild(childLi);

    const chatbox = document.querySelector('#chat-box');
    chatbox.scrollTop = chatbox.scrollHeight; 
};

function onChatEnter(e)
{
    if(e.which === 13 && !e.shiftKey)
    {
        e.preventDefault();
        onChatSubmit();
    }
}
document.querySelector('#chat-input').addEventListener('keypress', onChatEnter);

const onChatSubmit = () => 
{
    const input = document.querySelector('#chat-input');
    let text = input.value;

    //NOTE: For now we don't allow user to submit space only, might change in the future
    let onlySpace = true;

    for(let i = 0; i < text.length; ++i)
    {
        if(text[i] != ' ') onlySpace = false;
    }

    if(text !== '' && !onlySpace)
    {
        writeLog(`${urlData.username}: ` + text);
        socket.emit('message', {username: urlData.username, message: text, room: gameCode});
    }
    input.value = '';
};
document.querySelector('#send-message').addEventListener('click', onChatSubmit);

socket.on('message', writeLog);

//Game
var config = 
{
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}
const board = Chessboard('game-board', config);
let game;

function onDragStart (source, piece, position, orientation) 
{
    if(game.is_gameover || game.is_draw) return false;

    if((game.turn === 'w' && game.color === 'b') || 
       (game.turn === 'b' && game.color === 'w')) 
    {
        return false;
    }
}
  
function onDrop (source, target) 
{
    socket.emit('on_move', game.color, source, target, gameCode);
    let move;
    socket.on('on_move', (gameState, moveData) => {
        move = moveData;
        game = gameState;
        updateStatus();
    });

    if(move === null) return 'snapback';
}

function onSnapEnd() 
{
    board.position(game.fen);
}

function updateStatus() 
{
    let status = '';
  
    let moveColor = 'White';
    if(game.turn === 'b') 
    {
        moveColor = 'Black';
    }
  
    if(game.is_checkmate) 
    {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
        rematchButton.style.display = 'inline';
        resignButton.style.display = 'none';
        drawButton.style.display = 'none';
    } 
    else if(game.is_draw) {
        status = 'Game over, drawn position';
        rematchButton.style.display = 'inline';
        resignButton.style.display = 'none';
        drawButton.style.display = 'none';
    }
    else 
    {
        status = moveColor + ' to move';
  
        if(game.is_check) 
        {
            status += ', ' + moveColor + ' is in check';
        }
    }
  
    $status.html(status);
    $fen.html(game.fen);
    $pgn.html(game.pgn);

    board.position(game.fen);
    if(game.color === 'b')
    {
        board.orientation('black');
    }
    else
    {
        board.orientation('white');
    }
}

socket.on('player_move', gameState => {
    game = gameState;
    updateStatus();
});

socket.on('draw_request', username => {
    document.querySelector('#draw-message-title').innerHTML = 'Draw request';
    document.querySelector('#draw-message-text').innerHTML = username + ' has initiated a draw request, will you accept?';
    drawMessageModal.show();
});

socket.on('rematch_request', username => {
    document.querySelector('#rematch-message-title').innerHTML = 'Rematch request';
    document.querySelector('#rematch-message-text').innerHTML = username + ' has initiated a rematch request, will you accept?';
    rematchMessageModal.show();
});


socket.on('player_disconnect', (gameState, username) => {
    alert(`${username} has abandoned the game. Resetting the game.`);
    game = gameState;
    updateStatus();
});

socket.on('new_game', (gameState) => {
    resignButton.style.display = 'inline';
    drawButton.style.display = 'inline';
    rematchButton.style.display = 'none';
    game = gameState;
    updateStatus();
});

socket.on('join_game_success', (gameState) => {
    game = gameState;
    board.position(game.fen);
    updateStatus();
    lobbyDiv.style.display = 'none';
    gameScreen.style.display = 'block';
});

socket.on('join_game_failure', () => {
    alert('Join game failed! Room does not exit! Please make sure you entered the correct game code.');
    gameCodeInput.value = '';
});

socket.on('join_game_failure_max_players', () => {
    alert('Join game failed! The game you\'re trying to join already have two players.');
    gameCodeInput.value = '';
});