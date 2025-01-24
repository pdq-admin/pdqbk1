document.addEventListener('DOMContentLoaded', function() {
    // 添加平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 添加文章hover效果
    const posts = document.querySelectorAll('.post');
    posts.forEach(post => {
        post.addEventListener('mouseenter', () => {
            post.style.boxShadow = '0 0 20px rgba(0, 255, 157, 0.2)';
        });
        
        post.addEventListener('mouseleave', () => {
            post.style.boxShadow = 'none';
        });
    });
});

// 聊天功能
let socket;
let username;

function initChat() {
    try {
        // 确保 Socket.IO 已加载
        if (typeof io === 'undefined') {
            console.error('Socket.IO 未加载');
            return;
        }

        // 连接到服务器
        socket = io('https://your-project.vercel.app');  // 替换为实际部署的地址
        
        // 连接事件处理
        socket.on('connect', () => {
            console.log('已连接到聊天服务器');
            
            // 获取用户名
            username = localStorage.getItem('chatUsername');
            if (!username) {
                username = '用户' + Math.floor(Math.random() * 1000);
                localStorage.setItem('chatUsername', username);
            }
            
            // 加入聊天
            socket.emit('join', username);
        });

        // 连接错误处理
        socket.on('connect_error', (error) => {
            console.error('连接错误:', error);
            addSystemMessage('连接服务器失败，请刷新页面重试');
        });

        // 监听消息
        socket.on('chat message', (data) => {
            const messages = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${data.username === username ? 'sent' : 'received'}`;
            
            messageDiv.innerHTML = `
                <div class="message-info">
                    ${data.username} - ${data.time}
                </div>
                <div class="message-content">
                    ${data.message}
                </div>
            `;
            
            messages.appendChild(messageDiv);
            messages.scrollTop = messages.scrollHeight;
        });

        // 监听用户列表更新
        socket.on('userList', (users) => {
            document.getElementById('userCount').textContent = users.length;
        });

        // 监听用户加入
        socket.on('userJoined', (user) => {
            if (user !== username) {
                addSystemMessage(`${user} 加入了聊天`);
            }
        });

        // 监听用户离开
        socket.on('userLeft', (user) => {
            addSystemMessage(`${user} 离开了聊天`);
        });

    } catch (error) {
        console.error('初始化聊天时出错:', error);
        addSystemMessage('初始化聊天失败，请刷新页面重试');
    }
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message && socket && socket.connected) {
        socket.emit('chat message', message);
        input.value = '';
    } else if (!socket || !socket.connected) {
        addSystemMessage('未连接到服务器，请刷新页面重试');
    }
}

function addSystemMessage(message) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.innerHTML = `
        <div class="message-content" style="color: var(--primary-color)">
            ${message}
        </div>
    `;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// 最小化聊天窗口
document.querySelector('.minimize-btn').addEventListener('click', () => {
    document.querySelector('.chat-container').classList.toggle('minimized');
    document.querySelector('.minimize-btn').textContent = 
        document.querySelector('.chat-container').classList.contains('minimized') ? '+' : '−';
});

// 等待 DOM 加载完成后初始化聊天
document.addEventListener('DOMContentLoaded', () => {
    initChat();
    
    // 绑定发送按钮点击事件
    const sendButton = document.querySelector('.chat-input button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // 绑定输入框回车事件
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
}); 