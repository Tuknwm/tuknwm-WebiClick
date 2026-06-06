document.addEventListener('DOMContentLoaded', function () {
    const friendToggle = document.getElementById('friendToggle');
    const searchToggle = document.getElementById('searchToggle');
    const slider = document.querySelector('.ToggleSlide');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.SearchPlayerBttn');
    const usersList = document.getElementById('usersList');
    const infoPanel = document.getElementById('infoPanel');
    const infoUsers = document.getElementById('infoUsers');
    const backButtonInfo = document.getElementById('backButtonInfo');
    const userInfoData = document.getElementById('userInfoData');
    const chatMessages = document.getElementById('chatMessages');
    const chatButton = document.getElementById('chatButton');
    const followButton = document.getElementById('followButton');
    const userInfoName = document.getElementById('userInfoName');
    const followRequestContainer = document.querySelector('.KotakUtamaDisplayReq');

    let currentMode = 'friend';
    let selectedUserId = null;
    let isFollowing = false;
    let isPanelOpen = false;
    let isChatOpen = false;

    // Dummy data
    const dummyUsers = [
        { _id: '1', username: 'Kaming', isFollowing: true,  scores: { mouse: {'5':52,'10':98,'15':130}, keyboard: {'5':44,'10':85,'15':110} } },
        { _id: '2', username: 'Charless', isFollowing: true,  scores: { mouse: {'5':61,'10':115,'15':160}, keyboard: {'5':50,'10':95,'15':140} } },
        { _id: '3', username: 'JoeNick', isFollowing: false, isPendingRequest: false, scores: { mouse: {'5':30,'10':60,'15':90}, keyboard: {'5':25,'10':55,'15':80} } },
        { _id: '4', username: 'PlayerX', isFollowing: false, isPendingRequest: true,  scores: { mouse: {'5':10,'10':20,'15':30}, keyboard: {'5':8,'10':18,'15':28} } },
    ];

    const dummyChats = {
        '1': [
            { sender: '1', message: 'Halo!' },
            { sender: 'me', message: 'Halo juga!' },
            { sender: '1', message: 'Score lu berapa?' },
            { sender: 'me', message: 'Lumayan hehe' },
        ],
        '2': [
            { sender: '2', message: 'GG wak!' },
            { sender: 'me', message: 'GG juga!' },
        ],
    };

    infoPanel.classList.add('hidden');
    if (followRequestContainer) followRequestContainer.style.display = 'none';

    friendToggle.addEventListener('click', () => {
        if (isPanelOpen) return;
        slider.style.transform = 'translateX(0%)';
        friendToggle.classList.add('active');
        searchToggle.classList.remove('active');
        currentMode = 'friend';
        loadUsers();
    });

    searchToggle.addEventListener('click', () => {
        slider.style.transform = 'translateX(100%)';
        searchToggle.classList.add('active');
        friendToggle.classList.remove('active');
        currentMode = 'search';
        loadUsers();
        if (isPanelOpen) closeInfoPanel();
    });

    searchButton.addEventListener('click', () => loadUsers(searchInput.value));
    searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') loadUsers(searchInput.value); });

    backButtonInfo.addEventListener('click', () => {
        if (isChatOpen) closeChatPanel();
        else closeInfoPanel();
    });

    chatButton.addEventListener('click', () => { if (isFollowing) openChatPanel(); });
    followButton.addEventListener('click', toggleFollow);

    loadUsers();

    function loadUsers(search = '') {
        let users = currentMode === 'friend'
            ? dummyUsers.filter(u => u.isFollowing)
            : dummyUsers.filter(u => !search || u.username.toLowerCase().includes(search.toLowerCase()));

        usersList.innerHTML = '';

        if (!users.length) {
            usersList.innerHTML = `<div class="EmptyState">${currentMode === 'friend' ? "You haven't followed anyone yet." : 'No users found.'}</div>`;
            return;
        }

        users.forEach(user => {
            const el = document.createElement('div');
            el.className = 'UserItem';
            el.dataset.userId = user._id;
            const isPending = !!user.isPendingRequest;
            const following = !!user.isFollowing;

            el.innerHTML = `
                <div class="UserItem-content" ${isPending ? 'style="border-color: yellow;"' : ''}>
                    <div class="UserInfo">
                        <span class="Username" data-original-name="${user.username}">${user.username}</span>
                    </div>
                    <div class="ForChatIcon">
                        ${following ? '<button class="ChatIcon">💬</button>' : ''}
                    </div>
                    <div class="UserActions">
                        <button class="FollowIcon">${following ? '❤️' : (isPending ? '🕒' : '➕')}</button>
                        <button class="InfoIcon">ℹ️</button>
                    </div>
                </div>
            `;

            usersList.appendChild(el);

            el.querySelector('.InfoIcon').addEventListener('click', () => loadUserInfo(user._id, user.username, following));
            el.querySelector('.FollowIcon').addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const u = dummyUsers.find(x => x._id === user._id);
                if (u.isFollowing) {
                    u.isFollowing = false;
                    btn.textContent = '➕';
                } else if (u.isPendingRequest) {
                    u.isPendingRequest = false;
                    btn.textContent = '➕';
                    btn.closest('.UserItem-content').style.borderColor = '';
                } else {
                    u.isPendingRequest = true;
                    btn.textContent = '🕒';
                    btn.closest('.UserItem-content').style.borderColor = 'yellow';
                }
                loadUsers(search);
            });

            const chatIcon = el.querySelector('.ChatIcon');
            if (chatIcon) {
                chatIcon.addEventListener('click', () => {
                    loadUserInfo(user._id, user.username, following);
                    setTimeout(() => openChatPanel(), 300);
                });
            }
        });
    }

    function loadUserInfo(userId, username, following) {
        selectedUserId = userId;
        isFollowing = following;
        userInfoName.textContent = username;
        userInfoName.setAttribute('data-original-name', username);

        followButton.textContent = following ? 'Unfollow' : 'Follow';
        if (following) {
            chatButton.classList.remove('hidden', 'disabled');
            chatButton.removeAttribute('disabled');
        } else {
            chatButton.classList.add('hidden', 'disabled');
            chatButton.setAttribute('disabled', 'disabled');
        }

        const user = dummyUsers.find(u => u._id === userId);
        if (user) {
            document.getElementById('score-mouse-5s').textContent = user.scores.mouse['5'];
            document.getElementById('score-mouse-10s').textContent = user.scores.mouse['10'];
            document.getElementById('score-mouse-15s').textContent = user.scores.mouse['15'];
            document.getElementById('score-keyboard-5s').textContent = user.scores.keyboard['5'];
            document.getElementById('score-keyboard-10s').textContent = user.scores.keyboard['10'];
            document.getElementById('score-keyboard-15s').textContent = user.scores.keyboard['15'];
        }

        openInfoPanel();
    }

    function openInfoPanel() {
        infoPanel.classList.remove('hidden');
        infoPanel.classList.add('grow-in');
        userInfoData.classList.remove('hidden');
        chatMessages.classList.add('hidden');
        isPanelOpen = true;
        isChatOpen = false;
        if (infoUsers) { infoUsers.classList.remove('slide-right'); infoUsers.classList.add('slide-left'); }
    }

    function closeInfoPanel() {
        infoPanel.classList.remove('slide-in');
        infoPanel.classList.add('grow-out');
        if (infoUsers) { infoUsers.classList.remove('slide-left'); infoUsers.classList.add('slide-right'); }
        setTimeout(() => {
            infoPanel.classList.add('hidden');
            infoPanel.classList.remove('grow-out');
            if (infoUsers) infoUsers.classList.remove('slide-right');
            isPanelOpen = false;
        }, 300);
    }

    function openChatPanel() {
        if (!isFollowing || !selectedUserId) return;
        userInfoData.classList.add('hidden');
        chatMessages.classList.remove('hidden');
        isChatOpen = true;
        const deleteBtn = document.getElementById('deleteChatButton');
        if (deleteBtn) deleteBtn.style.display = 'inline-block';
        renderChatMessages();
    }

    function closeChatPanel() {
        chatMessages.classList.add('hidden');
        userInfoData.classList.remove('hidden');
        isChatOpen = false;
        const deleteBtn = document.getElementById('deleteChatButton');
        if (deleteBtn) deleteBtn.style.display = 'none';
    }

    function renderChatMessages() {
        const msgs = dummyChats[selectedUserId] || [];
        chatMessages.innerHTML = '';

        if (!msgs.length) {
            const empty = document.createElement('div');
            empty.className = 'EmptyChat';
            empty.textContent = 'Say hello! 😊';
            chatMessages.appendChild(empty);
        } else {
            msgs.forEach(msg => {
                const el = document.createElement('div');
                el.className = `ChatMessage ${msg.sender === 'me' ? 'sent' : 'received'}`;
                el.textContent = msg.message;
                chatMessages.appendChild(el);
            });
        }

        const inputDiv = document.createElement('div');
        inputDiv.className = 'ChatInput';
        inputDiv.innerHTML = `<input type="text" id="messageInput" placeholder="Type a message..."><button id="sendMessageBtn">Send</button>`;
        chatMessages.appendChild(inputDiv);

        document.getElementById('messageInput').addEventListener('keyup', (e) => { if (e.key === 'Enter') sendMessage(); });
        document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);

        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input?.value?.trim();
        if (!text || !selectedUserId) return;

        if (!dummyChats[selectedUserId]) dummyChats[selectedUserId] = [];
        dummyChats[selectedUserId].push({ sender: 'me', message: text });
        input.value = '';
        renderChatMessages();
    }

    function toggleFollow() {
        if (!selectedUserId) return;
        const user = dummyUsers.find(u => u._id === selectedUserId);
        if (!user) return;
        user.isFollowing = !user.isFollowing;
        isFollowing = user.isFollowing;
        followButton.textContent = isFollowing ? 'Unfollow' : 'Follow';
        if (isFollowing) {
            chatButton.classList.remove('hidden', 'disabled');
            chatButton.removeAttribute('disabled');
        } else {
            chatButton.classList.add('hidden', 'disabled');
            chatButton.setAttribute('disabled', 'disabled');
            if (isChatOpen) closeChatPanel();
        }
        if (currentMode === 'friend') loadUsers();
    }
});
