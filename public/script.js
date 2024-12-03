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
const header = document.getElementById('header');

let token, username, room;

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}

function addMessage(username, msg, sender) {
    const item = document.createElement('li');
    item.className = `mb-4 flex ${socket.id === sender ? 'justify-end' : 'justify-start'}`;

    const messageBubble = document.createElement('div');
    messageBubble.className = `rounded-lg p-3 shadow-md max-w-sm ${
        socket.id === sender ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
    }`;

    if (socket.id !== sender) {
        const senderName = document.createElement('p');
        senderName.className = 'text-sm text-green-400 font-medium mb-1';
        senderName.textContent = username;
        messageBubble.appendChild(senderName);
    }

    const messageText = document.createElement('p');
    messageText.textContent = msg;
    messageBubble.appendChild(messageText);

    item.appendChild(messageBubble);
    messages.appendChild(item);
    scrollToBottom();
}

function addFileMessage(username, filename, sender) {
    const item = document.createElement('li');
    item.className = `mb-4 flex ${socket.id === sender ? 'justify-end' : 'justify-start'}`;

    const messageBubble = document.createElement('div');
    messageBubble.className = `rounded-lg p-3 shadow-md max-w-sm ${
        socket.id === sender ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
    }`;

    if (socket.id !== sender) {
        const senderName = document.createElement('p');
        senderName.className = 'text-sm text-green-400 font-medium mb-1';
        senderName.textContent = username;
        messageBubble.appendChild(senderName);
    }

    const fileExtension = filename.split('.').pop().toLowerCase();
    let fileIcon;

    const link = document.createElement('a');
    link.href = `/uploads/${filename}`;
    link.target = '_blank';
    link.download = filename;

    if (imageExtensions.includes(fileExtension)) {
        // Render image preview
        const img = document.createElement('img');
        img.src = `/uploads/${filename}`;
        img.alt = filename;
        img.className = 'rounded-md max-w-full h-auto';
        link.appendChild(img);
    } else {
        // Render file download link
        link.textContent = `📎 Download ${filename}`;
        link.className = 'underline text-blue-400 hover:text-blue-500';
    }

    messageBubble.appendChild(link);
    item.appendChild(messageBubble);
    messages.appendChild(item);
    scrollToBottom();
}

loginButton.addEventListener('click', () => {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                token = data.token;
                username = data.username;

                loginContainer.classList.add('hidden');
                joinContainer.classList.remove('hidden');
            } else {
                alert('Login failed. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
});

signupButton.addEventListener('click', () => {
    const username = signupUsernameInput.value;
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                token = data.token;
                username = data.username;

                signupContainer.classList.add('hidden');
                joinContainer.classList.remove('hidden');
            } else {
                alert('Signup failed. Please try again.');
            }
        })
        .catch(error => console.error('Error:', error));
});

showSignupLink.addEventListener('click', () => {
    loginContainer.classList.add('hidden');
    signupContainer.classList.remove('hidden');
});

showLoginLink.addEventListener('click', () => {
    signupContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
});

joinButton.addEventListener('click', () => {
    room = roomInput.value;
    if (room) {
        joinContainer.classList.add('hidden');
        messages.classList.remove('hidden');
        messageInput.parentElement.classList.remove('hidden');
        logoutButton.classList.remove('hidden');
        header.textContent = `${room}`; // Update header with room name

        socket.emit('join', { token, username, room });
    } else {
        alert('Please enter a room key.');
    }
});

logoutButton.addEventListener('click', () => {
    socket.emit('leave', { room });
    location.reload();
});

sendButton.addEventListener('click', () => {
    const msg = messageInput.value;
    if (msg.trim()) {
        socket.emit('chat message', { msg, room });
        messageInput.value = '';
    }
});

uploadButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.filename) {
                    socket.emit('file message', { filename: data.filename, room });
                } else {
                    alert('File upload failed. Please try again.');
                }
            })
            .catch(error => console.error('Error:', error));
    }
});

socket.on('chat message', (data) => {
    addMessage(data.username, data.msg, data.sender);
});

socket.on('file message', (data) => {
    addFileMessage(data.username, data.filename, data.sender);
});
