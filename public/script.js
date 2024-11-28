const socket = io();
const messages = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const uploadButton = document.getElementById('upload-button');
const fileInput = document.getElementById('file-input');
const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');
const joinContainer = document.getElementById('join-container');
const loginEmailInput = document.getElementById('login-email-input');
const loginPasswordInput = document.getElementById('login-password-input');
const signupUsernameInput = document.getElementById('signup-username-input');
const signupEmailInput = document.getElementById('signup-email-input');
const signupPasswordInput = document.getElementById('signup-password-input');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const roomInput = document.getElementById('room-input');
const joinButton = document.getElementById('join-button');
const logoutButton = document.getElementById('logout-button');

let token, username, room;

function scrollToBottom(){
    messages.scrollTop = messages.scrollHeight;
}

function addMessage(username, msg, sender){
    const item = document.createElement('li');
    item.className = socket.id === sender ? 'sender' : 'receiver';
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.style.backgroundColor = socket.id === sender ? '#d4edda' : '#ffffff';
    messageContent.textContent = `${username}: ${msg}`;
    item.appendChild(messageContent);
    messages.appendChild(item);
    scrollToBottom();
}

function addFileMessage(username, filename, sender){
    const item = document.createElement('li');
    item.className = socket.id === sender ? 'sender' : 'receiver';
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.style.backgroundColor = socket.id === sender ? '#d4edda' : '#ffffff';
    
    const link = document.createElement('a');
    link.href = `/uploads/${filename}`;
    link.target = '_blank';
    link.textContent = `${username} sent a file: ${filename}`;
    messageContent.appendChild(link);

    item.appendChild(messageContent);
    messages.appendChild(item);
    scrollToBottom();
}

function showJoinContainer(){
    loginContainer.style.display = 'none';
    signupContainer.style.display = 'none';
    joinContainer.style.display = 'block';
    logoutButton.style.display = 'block';
}

showSignupLink.addEventListener('click', () => {
    loginContainer.style.display = 'none';
    signupContainer.style.display = 'block';
});

showLoginLink.addEventListener('click', () => {
    signupContainer.style.display = 'none';
    loginContainer.style.display = 'block';
});

loginButton.addEventListener('click', () => {
    const email = loginEmailInput.value.trim();
    const password = loginPasswordInput.value.trim();
    if(email && password){
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        })
        .then(response => response.json())
        .then(data => {
            if(data.token){
                token = data.token;
                username = data.username;
                socket.auth = {token};
                socket.connect();
                showJoinContainer();
            }else{
                alert('Login failed');
            }
        })
        .catch(error => console.error('Error logging in:', error));
    }
});

signupButton.addEventListener('click', () => {
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value.trim();
    const username = signupUsernameInput.value.trim();
    if(email && password && username){
        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password, username})
        })
        .then(response => response.json())
        .then(data => {
            if(data.message){
                alert('Signup successful');
                signupContainer.style.display = 'none';
                loginContainer.style.display = 'block';
            }else{
                alert('Signup failed');
            }
        })
        .catch(error => console.error('Error signing up:', error));
    }
});

joinButton.addEventListener('click', () => {
    room = roomInput.value.trim();
    if(room){
        socket.emit('join room', {username, room});
        joinContainer.style.display = 'none';
        messages.style.display = 'block';
        document.querySelector('.input-container').style.display = 'flex';
    }
});

logoutButton.addEventListener('click', () => {
    token = null;
    username = null;
    room = null;
    socket.disconnect();
    joinContainer.style.display = 'none';
    messages.style.display = 'none';
    document.querySelector('.input-container').style.display = 'none';
    loginContainer.style.display = 'block';
    logoutButton.style.display = 'none';
});

sendButton.addEventListener('click', () => {
    const msg = messageInput.value;
    if(msg){
        socket.emit('chat message', msg);
        messageInput.value = '';
    }
});

messageInput.addEventListener('keydown', (event) => {
    if(event.key === 'Enter'){
        const msg = messageInput.value;
        if(msg){
            socket.emit('chat message', msg);
            messageInput.value = '';
        }
    }
});

uploadButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if(file && file.size <= 25 * 1024 * 1024){ // 25MB limit
        const formData = new FormData();
        formData.append('file', file);
        fetch('/upload', {
            method: 'POST',
            headers: {
                'Authorization': token
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            socket.emit('file message', data.filename);
        })
        .catch(error => console.error('Error uploading file:', error));
    }else{
        alert('File is too large or not selected');
    }
});

socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
    if(err.message === 'Authentication error'){
        alert('Authentication failed, please log in again.');
        logoutButton.click();
    }
});

socket.on('chat message', ({username, msg, sender}) => {
    addMessage(username, msg, sender);
});

socket.on('file message', ({username, filename, sender}) => {
    addFileMessage(username, filename, sender);
});