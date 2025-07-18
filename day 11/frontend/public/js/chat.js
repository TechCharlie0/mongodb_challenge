const chat = {
    currentChatPartnerId: null,
    chatMessagesContainer: null,
    chatInput: null,
    chatPartnerName: null,
    noMessagesText: null,

    init: () => {
        chat.chatMessagesContainer = document.getElementById('chat-messages');
        chat.chatInput = document.getElementById('chat-input');
        chat.chatPartnerName = document.getElementById('chat-partner-name');
        chat.noMessagesText = document.getElementById('no-messages');

        document.getElementById('chat-form').addEventListener('submit', chat.sendMessage);
        document.getElementById('back-to-matches-btn').addEventListener('click', () => {
            app.showSection('matches-section');
        });
    },

    loadMessages: async (partnerId, partnerName) => {
        chat.currentChatPartnerId = partnerId;
        chat.chatPartnerName.textContent = `Chat with ${partnerName}`;
        chat.chatMessagesContainer.innerHTML = ''; // Clear previous messages
        chat.noMessagesText.classList.add('hidden');

        try {
            const messages = await api.request(`/messages/${partnerId}`);
            if (messages.length === 0) {
                chat.noMessagesText.classList.remove('hidden');
            } else {
                messages.forEach(msg => chat.displayMessage(msg));
                chat.chatMessagesContainer.scrollTop = chat.chatMessagesContainer.scrollHeight; // Scroll to bottom
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
            alert('Failed to load messages: ' + error.message);
        }
    },

    sendMessage: async (event) => {
        event.preventDefault();
        const messageText = chat.chatInput.value.trim();
        if (!messageText || !chat.currentChatPartnerId) return;

        try {
            const currentUser = await auth.getMe();
            const newMessage = await api.request('/messages', 'POST', {
                receiverId: chat.currentChatPartnerId,
                messageText
            });
            // Update the UI immediately with the new message
            chat.displayMessage(newMessage, currentUser.id); // Pass current user ID to determine sender/receiver style
            chat.chatInput.value = ''; // Clear input
            chat.chatMessagesContainer.scrollTop = chat.chatMessagesContainer.scrollHeight; // Scroll to bottom
            chat.noMessagesText.classList.add('hidden'); // Hide if it was visible
        } catch (error) {
            alert('Failed to send message: ' + error.message);
        }
    },

    displayMessage: (message, currentUserId) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('flex', 'flex-col', 'max-w-xs');

        const senderClass = message.sender_id === currentUserId ? 'message-bubble-sender self-end' : 'message-bubble-receiver self-start';
        messageElement.innerHTML = `
            <div class="${senderClass}">
                <p>${message.message_text}</p>
                <span class="text-xs text-right opacity-75 mt-1 block">${new Date(message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
        chat.chatMessagesContainer.appendChild(messageElement);
    },

    // You would integrate Socket.IO here for real-time updates
    // For example:
    // setupWebSocket: (userId) => {
    //     const socket = io('http://localhost:3000'); // Connect to your backend Socket.IO server
    //
    //     socket.emit('joinRoom', userId);
    //
    //     socket.on('receiveMessage', (message) => {
    //         if (message.sender_id === chat.currentChatPartnerId || message.receiver_id === chat.currentChatPartnerId) {
    //             chat.displayMessage(message);
    //             chat.chatMessagesContainer.scrollTop = chat.chatMessagesContainer.scrollHeight;
    //             chat.noMessagesText.classList.add('hidden');
    //         }
    //     });
    // }
};