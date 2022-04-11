const sock = io();

//Get username from url
const username = Qs.parse(location.search, {ignoreQueryPrefix: true});
sock.emit('join_chat', username);

//chat.html
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
        e.target.form.dispatchEvent(new Event("submit", {cancelable: true}));
    }
}

document.querySelector('#chat-input').addEventListener('keypress', onChatEnter);

const onChatSubmit = (e) => 
{
    e.preventDefault();

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
        sock.emit('message', text);
    }
    input.value = '';
};

document.querySelector('#chat-form').addEventListener('submit', onChatSubmit);

sock.on('message', writeLog);