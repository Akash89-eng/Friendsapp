// Messaging System
class Messages {
    constructor(app) {
        this.app = app;
        this.utils = window.utils;
        this.conversations = [];
        this.currentConversation = null;
        this.unreadCount = 0;
        this.initialize();
    }

    initialize() {
        this.loadDemoData();
        this.setupEventListeners();
        this.updateBadge();
    }

    loadDemoData() {
        // Demo conversations data
        this.conversations = [
            {
                id: 1,
                type: 'direct',
                participants: [2, 1], // Sarah Johnson and current user
                otherUser: {
                    id: 2,
                    name: "Sarah Johnson",
                    avatar: "SJ",
                    online: true,
                    status: "Active now"
                },
                lastMessage: {
                    text: "Can't wait to see you tomorrow! 😊",
                    time: "10:30 AM",
                    senderId: 2,
                    read: false
                },
                unreadCount: 2,
                muted: false
            },
            {
                id: 2,
                type: 'direct',
                participants: [3, 1], // Mike Chen and current user
                otherUser: {
                    id: 3,
                    name: "Mike Chen",
                    avatar: "MC",
                    online: true,
                    status: "Active 5m ago"
                },
                lastMessage: {
                    text: "Thanks for the help with the project! 🚀",
                    time: "Yesterday",
                    senderId: 1,
                    read: true
                },
                unreadCount: 0,
                muted: false
            },
            {
                id: 3,
                type: 'group',
                name: "Weekend Warriors",
                participants: [1, 2, 3, 4, 5],
                avatar: "WW",
                lastMessage: {
                    text: "Alex: Who's bringing snacks? 🍕",
                    time: "2 days ago",
                    senderId: 5,
                    read: true
                },
                unreadCount: 5,
                muted: false
            },
            {
                id: 4,
                type: 'direct',
                participants: [4, 1], // Emma Davis and current user
                otherUser: {
                    id: 4,
                    name: "Emma Davis",
                    avatar: "ED",
                    online: false,
                    status: "Offline"
                },
                lastMessage: {
                    text: "Let's catch up soon! ☕",
                    time: "3 days ago",
                    senderId: 1,
                    read: true
                },
                unreadCount: 0,
                muted: true
            }
        ];

        this.calculateUnreadCount();
    }

    setupEventListeners() {
        // Messages button
        const messagesBtn = document.getElementById('messagesBtn');
        if (messagesBtn) {
            messagesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMessages();
            });
        }

        // Message individual friends
        document.addEventListener('click', (e) => {
            const messageBtn = e.target.closest('.message-btn');
            if (messageBtn) {
                const friendId = messageBtn.closest('[data-friend-id]')?.dataset.friendId;
                if (friendId) {
                    this.startConversation(parseInt(friendId));
                }
            }
        });
    }

    calculateUnreadCount() {
        this.unreadCount = this.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
    }

    updateBadge() {
        const badge = document.getElementById('messageBadge');
        if (badge) {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        }
    }

    showMessages() {
        // Mark all as read when opening messages
        this.markAllAsRead();
        
        // Create messages overlay
        const overlay = this.createMessagesOverlay();
        document.body.appendChild(overlay);
    }

    createMessagesOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'messages-overlay';
        
        overlay.innerHTML = `
            <div class="messages-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-comments"></i> Messages</h3>
                    <div class="header-actions">
                        <button class="btn btn-sm btn-secondary" id="newMessageBtn">
                            <i class="fas fa-edit"></i> New Message
                        </button>
                        <button class="close-modal">&times;</button>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="conversations-list" id="conversationsList">
                        ${this.conversations.map(conv => this.createConversationItem(conv)).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="footer-info">
                        <span class="online-count">
                            <i class="fas fa-circle text-success"></i> 
                            ${this.getOnlineFriendsCount()} friends online
                        </span>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        overlay.querySelector('.close-modal').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.querySelector('#newMessageBtn').addEventListener('click', () => {
            this.showNewMessageModal();
        });

        overlay.querySelectorAll('.conversation-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.openConversation(this.conversations[index]);
            });
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        return overlay;
    }

    createConversationItem(conversation) {
        const isGroup = conversation.type === 'group';
        const name = isGroup ? conversation.name : conversation.otherUser.name;
        const avatar = isGroup ? conversation.avatar : conversation.otherUser.avatar;
        const status = isGroup ? `${conversation.participants.length} members` : 
                       conversation.otherUser.online ? 'Online' : 'Offline';
        const statusClass = isGroup ? 'group' : (conversation.otherUser.online ? 'online' : 'offline');
        
        const unreadBadge = conversation.unreadCount > 0 ? 
            `<span class="unread-badge">${conversation.unreadCount}</span>` : '';
        
        const muteIcon = conversation.muted ? '<i class="fas fa-volume-mute muted-icon"></i>' : '';

        return `
            <div class="conversation-item ${conversation.unreadCount > 0 ? 'unread' : ''}" 
                 data-conversation-id="${conversation.id}">
                <div class="conversation-avatar" style="position: relative;">
                    ${avatar}
                    ${!isGroup && conversation.otherUser.online ? 
                        '<div class="online-status"></div>' : ''}
                </div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <h4>${name} ${muteIcon}</h4>
                        <span class="conversation-time">${conversation.lastMessage.time}</span>
                    </div>
                    <div class="conversation-preview">
                        <p class="message-preview">
                            ${conversation.lastMessage.senderId === this.app.auth.getUser()?.id ? 
                                'You: ' : ''}
                            ${conversation.lastMessage.text}
                        </p>
                        ${unreadBadge}
                    </div>
                    <div class="conversation-status ${statusClass}">
                        ${status}
                    </div>
                </div>
            </div>
        `;
    }

    getOnlineFriendsCount() {
        const friends = this.app.friends.friends;
        return friends.filter(f => f.online).length;
    }

    openConversation(conversation) {
        this.currentConversation = conversation;
        
        // Mark as read
        this.markConversationAsRead(conversation.id);
        
        // Create chat window
        const chatOverlay = this.createChatWindow(conversation);
        document.body.appendChild(chatOverlay);
    }

    createChatWindow(conversation) {
        const overlay = document.createElement('div');
        overlay.className = 'chat-overlay';
        
        const isGroup = conversation.type === 'group';
        const name = isGroup ? conversation.name : conversation.otherUser.name;
        const avatar = isGroup ? conversation.avatar : conversation.otherUser.avatar;
        const status = isGroup ? 'Group' : (conversation.otherUser.online ? 'Online' : 'Offline');
        
        // Generate demo messages
        const messages = this.generateDemoMessages(conversation);
        
        overlay.innerHTML = `
            <div class="chat-window">
                <div class="chat-header">
                    <div class="chat-user-info">
                        <div class="user-avatar" style="position: relative;">
                            ${avatar}
                            ${!isGroup && conversation.otherUser.online ? 
                                '<div class="online-status"></div>' : ''}
                        </div>
                        <div class="user-details">
                            <h4>${name}</h4>
                            <span class="user-status">${status}</span>
                        </div>
                    </div>
                    <div class="chat-actions">
                        <button class="btn btn-sm btn-secondary" data-tooltip="Voice Call">
                            <i class="fas fa-phone"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" data-tooltip="Video Call">
                            <i class="fas fa-video"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" data-tooltip="More Options">
                            <i class="fas fa-ellipsis-h"></i>
                        </button>
                        <button class="close-chat">&times;</button>
                    </div>
                </div>
                <div class="chat-body" id="chatMessages">
                    <div class="messages-container">
                        ${messages.map(msg => this.createMessageElement(msg)).join('')}
                    </div>
                </div>
                <div class="chat-footer">
                    <div class="message-input-container">
                        <button class="btn btn-sm btn-secondary attachment-btn" data-tooltip="Attach">
                            <i class="fas fa-paperclip"></i>
                        </button>
                        <input type="text" 
                               class="message-input" 
                               id="messageInput"
                               placeholder="Type a message...">
                        <button class="btn btn-sm btn-primary send-btn" id="sendMessageBtn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="input-actions">
                        <button class="btn btn-sm btn-secondary" data-tooltip="Emoji">
                            <i class="fas fa-smile"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" data-tooltip="GIF">
                            <i class="fas fa-film"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" data-tooltip="Sticker">
                            <i class="fas fa-sticky-note"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        overlay.querySelector('.close-chat').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.querySelector('#sendMessageBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        overlay.querySelector('#messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        overlay.querySelector('.attachment-btn').addEventListener('click', () => {
            this.showAttachmentOptions();
        });

        // Scroll to bottom of messages
        setTimeout(() => {
            const messagesContainer = overlay.querySelector('.messages-container');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 100);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        return overlay;
    }

    generateDemoMessages(conversation) {
        const isGroup = conversation.type === 'group';
        const participants = isGroup ? conversation.participants : [conversation.otherUser.id, 1];
        
        const messageTexts = [
            "Hey there! 👋",
            "How's it going?",
            "Did you see the new update?",
            "Let's meet up this weekend!",
            "Check out this cool article I found 📚",
            "Thanks for your help earlier! 🙏",
            "Can't wait to see the results! 🚀",
            "What do you think about this?",
            "That sounds like a great plan!",
            "I'll send you the details shortly 📧"
        ];

        return Array.from({ length: 10 }, (_, i) => {
            const senderId = participants[Math.floor(Math.random() * participants.length)];
            const isCurrentUser = senderId === 1;
            
            return {
                id: Date.now() + i,
                senderId: senderId,
                text: messageTexts[Math.floor(Math.random() * messageTexts.length)],
                time: this.utils.formatRelativeTime(Date.now() - Math.random() * 86400000), // Within last day
                read: Math.random() > 0.3,
                isCurrentUser: isCurrentUser,
                type: Math.random() > 0.8 ? 'image' : 'text',
                reactions: Math.random() > 0.7 ? ['👍', '❤️', '😂'] : []
            };
        }).sort((a, b) => a.id - b.id);
    }

    createMessageElement(message) {
        const isCurrentUser = message.isCurrentUser;
        const user = isCurrentUser ? 
            this.app.auth.getUser() : 
            this.app.friends.getFriendById(message.senderId);
        
        const userName = user?.name || 'Unknown';
        const avatar = user?.avatar || 'U';
        const time = this.utils.formatRelativeTime(message.time);
        
        const reactions = message.reactions && message.reactions.length > 0 ? 
            `<div class="message-reactions">
                ${message.reactions.map(r => `<span class="reaction">${r}</span>`).join('')}
            </div>` : '';
        
        const readStatus = isCurrentUser ? 
            `<div class="message-status ${message.read ? 'read' : 'sent'}">
                <i class="fas fa-check${message.read ? '-double' : ''}"></i>
            </div>` : '';
        
        return `
            <div class="message ${isCurrentUser ? 'sent' : 'received'}" 
                 data-message-id="${message.id}">
                ${!isCurrentUser ? `
                    <div class="message-avatar">
                        ${avatar}
                    </div>
                ` : ''}
                <div class="message-content">
                    ${!isCurrentUser ? `<div class="message-sender">${userName}</div>` : ''}
                    <div class="message-bubble">
                        ${message.text}
                        ${reactions}
                    </div>
                    <div class="message-info">
                        <span class="message-time">${time}</span>
                        ${readStatus}
                    </div>
                </div>
            </div>
        `;
    }

    sendMessage() {
        const input = document.querySelector('#messageInput');
        const text = input?.value.trim();
        
        if (!text) return;
        
        // Create new message object
        const newMessage = {
            id: Date.now(),
            senderId: 1, // Current user
            text: text,
            time: new Date().toISOString(),
            read: false,
            isCurrentUser: true,
            type: 'text',
            reactions: []
        };
        
        // Add to current conversation
        if (this.currentConversation) {
            this.currentConversation.lastMessage = {
                text: text,
                time: 'Just now',
                senderId: 1,
                read: false
            };
            this.currentConversation.unreadCount = 0;
        }
        
        // Update UI
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            const messageElement = this.createMessageElement(newMessage);
            messagesContainer.insertAdjacentHTML('beforeend', messageElement);
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Clear input
        if (input) {
            input.value = '';
        }
        
        // Show typing indicator for other user (simulated)
        this.showTypingIndicator();
    }

    showTypingIndicator() {
        const messagesContainer = document.querySelector('.messages-container');
        if (!messagesContainer) return;
        
        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Remove after delay (simulate response)
        setTimeout(() => {
            typingIndicator.remove();
            
            // Simulate response message
            setTimeout(() => {
                this.simulateResponse();
            }, 500);
        }, 1500);
    }

    simulateResponse() {
        const responses = [
            "That's interesting!",
            "I agree with you!",
            "Let me think about that...",
            "Sounds like a plan! 👍",
            "Thanks for sharing!",
            "I'll get back to you on that",
            "Looking forward to it!",
            "Can't wait! 😊"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const newMessage = {
            id: Date.now(),
            senderId: this.currentConversation?.otherUser?.id || 2,
            text: randomResponse,
            time: new Date().toISOString(),
            read: false,
            isCurrentUser: false,
            type: 'text',
            reactions: []
        };
        
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer && this.currentConversation) {
            const messageElement = this.createMessageElement(newMessage);
            messagesContainer.insertAdjacentHTML('beforeend', messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            
            // Update conversation last message
            this.currentConversation.lastMessage = {
                text: randomResponse,
                time: 'Just now',
                senderId: newMessage.senderId,
                read: false
            };
        }
    }

    showAttachmentOptions() {
        const options = ['Photo/Video', 'Document', 'Camera', 'Location', 'Contact'];
        
        const menu = document.createElement('div');
        menu.className = 'attachment-menu';
        menu.innerHTML = options.map(option => 
            `<div class="attachment-option">
                <i class="fas fa-${this.getAttachmentIcon(option)}"></i>
                <span>${option}</span>
            </div>`
        ).join('');
        
        const inputContainer = document.querySelector('.message-input-container');
        if (inputContainer) {
            inputContainer.appendChild(menu);
            
            // Close on outside click
            setTimeout(() => {
                const closeMenu = (e) => {
                    if (!menu.contains(e.target) && !inputContainer.querySelector('.attachment-btn').contains(e.target)) {
                        menu.remove();
                        document.removeEventListener('click', closeMenu);
                    }
                };
                document.addEventListener('click', closeMenu);
            });
        }
    }

    getAttachmentIcon(option) {
        const icons = {
            'Photo/Video': 'image',
            'Document': 'file',
            'Camera': 'camera',
            'Location': 'map-marker-alt',
            'Contact': 'address-book'
        };
        return icons[option] || 'paperclip';
    }

    startConversation(friendId) {
        const friend = this.app.friends.getFriendById(friendId);
        if (!friend) return;
        
        // Check if conversation already exists
        let conversation = this.conversations.find(conv => 
            conv.type === 'direct' && conv.otherUser.id === friendId
        );
        
        if (!conversation) {
            // Create new conversation
            conversation = {
                id: this.conversations.length + 1,
                type: 'direct',
                participants: [friendId, 1],
                otherUser: friend,
                lastMessage: {
                    text: "Start a conversation...",
                    time: "Just now",
                    senderId: 1,
                    read: true
                },
                unreadCount: 0,
                muted: false
            };
            
            this.conversations.unshift(conversation);
        }
        
        this.openConversation(conversation);
    }

    markConversationAsRead(conversationId) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation && conversation.unreadCount > 0) {
            conversation.unreadCount = 0;
            this.calculateUnreadCount();
            this.updateBadge();
        }
    }

    markAllAsRead() {
        this.conversations.forEach(conv => {
            conv.unreadCount = 0;
        });
        this.unreadCount = 0;
        this.updateBadge();
    }

    // New message modal
    showNewMessageModal() {
        const modal = document.createElement('div');
        modal.className = 'new-message-modal';
        
        const friends = this.app.friends.friends;
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h4><i class="fas fa-edit"></i> New Message</h4>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="search-section">
                        <input type="text" 
                               class="search-input" 
                               placeholder="Search friends..."
                               id="messageSearch">
                    </div>
                    <div class="friends-list" id="messageFriendsList">
                        ${friends.map(friend => `
                            <div class="friend-select-item" data-friend-id="${friend.id}">
                                <div class="user-avatar" style="position: relative;">
                                    ${friend.avatar}
                                    ${friend.online ? '<div class="online-status"></div>' : ''}
                                </div>
                                <div class="friend-info">
                                    <h5>${friend.name}</h5>
                                    <span class="friend-status">${friend.status}</span>
                                </div>
                                <button class="btn btn-primary btn-sm select-friend">
                                    Message
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#messageSearch').addEventListener('input', (e) => {
            this.filterFriendsForMessage(e.target.value, modal.querySelector('#messageFriendsList'));
        });
        
        modal.querySelectorAll('.select-friend').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.startConversation(friends[index].id);
                modal.remove();
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    filterFriendsForMessage(query, container) {
        const searchTerm = query.toLowerCase();
        const friends = this.app.friends.friends;
        const filteredFriends = friends.filter(friend => 
            friend.name.toLowerCase().includes(searchTerm)
        );
        
        container.innerHTML = filteredFriends.map(friend => `
            <div class="friend-select-item" data-friend-id="${friend.id}">
                <div class="user-avatar" style="position: relative;">
                    ${friend.avatar}
                    ${friend.online ? '<div class="online-status"></div>' : ''}
                </div>
                <div class="friend-info">
                    <h5>${friend.name}</h5>
                    <span class="friend-status">${friend.status}</span>
                </div>
                <button class="btn btn-primary btn-sm select-friend">
                    Message
                </button>
            </div>
        `).join('');
        
        // Re-add event listeners
        container.querySelectorAll('.select-friend').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.startConversation(filteredFriends[index].id);
                document.querySelector('.new-message-modal')?.remove();
            });
        });
    }

    // Get conversation by ID
    getConversation(conversationId) {
        return this.conversations.find(c => c.id === conversationId);
    }

    // Get all conversations
    getAllConversations() {
        return [...this.conversations];
    }

    // Delete conversation
    deleteConversation(conversationId) {
        const index = this.conversations.findIndex(c => c.id === conversationId);
        if (index !== -1) {
            this.conversations.splice(index, 1);
            this.calculateUnreadCount();
            this.updateBadge();
            return true;
        }
        return false;
    }

    // Mute/unmute conversation
    toggleMuteConversation(conversationId) {
        const conversation = this.getConversation(conversationId);
        if (conversation) {
            conversation.muted = !conversation.muted;
            return true;
        }
        return false;
    }
}

// Export
window.messages = new Messages(window.app);
