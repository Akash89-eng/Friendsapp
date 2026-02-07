// Friends System
class Friends {
    constructor(app) {
        this.app = app;
        this.utils = window.utils;
        this.friends = [];
        this.friendRequests = [];
        this.onlineFriends = [];
        this.initialize();
    }

    initialize() {
        this.loadDemoData();
        this.renderFriendRequests();
        this.renderOnlineFriends();
        this.setupEventListeners();
    }

    loadDemoData() {
        // Demo friends data
        this.friends = [
            { id: 2, name: "Sarah Johnson", avatar: "SJ", mutual: 12, online: true, status: "Active now" },
            { id: 3, name: "Mike Chen", avatar: "MC", mutual: 8, online: true, status: "Active 5m ago" },
            { id: 4, name: "Emma Davis", avatar: "ED", mutual: 15, online: false, status: "Offline" },
            { id: 5, name: "Alex Taylor", avatar: "AT", mutual: 6, online: true, status: "Active now" },
            { id: 6, name: "Lisa Wong", avatar: "LW", mutual: 20, online: false, status: "Offline" },
            { id: 7, name: "David Miller", avatar: "DM", mutual: 4, online: true, status: "Active 10m ago" },
            { id: 8, name: "Sophia Clark", avatar: "SC", mutual: 7, online: true, status: "Active now" }
        ];

        this.friendRequests = [
            { id: 9, name: "Robert Garcia", avatar: "RG", mutual: 3, time: "2 hours ago" },
            { id: 10, name: "Jessica Lee", avatar: "JL", mutual: 5, time: "1 day ago" },
            { id: 11, name: "Daniel Kim", avatar: "DK", mutual: 2, time: "3 days ago" },
            { id: 12, name: "Sophia Williams", avatar: "SW", mutual: 7, time: "1 week ago" },
            { id: 13, name: "Michael Brown", avatar: "MB", mutual: 4, time: "2 weeks ago" }
        ];

        this.updateOnlineFriends();
    }

    setupEventListeners() {
        // View all requests button
        const viewAllBtn = document.getElementById('viewAllRequestsBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => this.showAllFriendRequests());
        }

        // Find friends button
        const findFriendsBtn = document.getElementById('findFriendsBtn');
        if (findFriendsBtn) {
            findFriendsBtn.addEventListener('click', () => this.showFindFriends());
        }

        // Friend list click handlers
        document.addEventListener('click', (e) => {
            const friendCard = e.target.closest('.friend-card, .friend-request');
            if (friendCard) {
                const friendId = friendCard.dataset.friendId;
                if (friendId) {
                    this.showFriendProfile(parseInt(friendId));
                }
            }
        });
    }

    renderFriendRequests() {
        const container = document.getElementById('friendRequestsList');
        if (!container) return;

        const recentRequests = this.friendRequests.slice(0, 3);

        if (recentRequests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-check"></i>
                    <p>No pending requests</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        recentRequests.forEach(request => {
            const requestElement = this.createFriendRequestElement(request);
            container.appendChild(requestElement);
        });
    }

    createFriendRequestElement(request) {
        const div = document.createElement('div');
        div.className = 'friend-request';
        div.dataset.friendId = request.id;
        
        div.innerHTML = `
            <div class="user-avatar">${request.avatar}</div>
            <div class="friend-info">
                <h4>${request.name}</h4>
                <p class="friend-mutual">
                    <i class="fas fa-user-friends"></i> ${request.mutual} mutual friends
                </p>
                <div class="friend-actions">
                    <button class="btn btn-success btn-sm accept-btn">
                        <i class="fas fa-check"></i> Accept
                    </button>
                    <button class="btn btn-secondary btn-sm decline-btn">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        div.querySelector('.accept-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.acceptFriendRequest(request.id);
        });

        div.querySelector('.decline-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.declineFriendRequest(request.id);
        });

        return div;
    }

    updateOnlineFriends() {
        this.onlineFriends = this.friends.filter(friend => friend.online);
    }

    renderOnlineFriends() {
        const container = document.getElementById('onlineFriends');
        if (!container) return;

        if (this.onlineFriends.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-slash"></i>
                    <p>No friends online</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        this.onlineFriends.forEach(friend => {
            const friendElement = this.createOnlineFriendElement(friend);
            container.appendChild(friendElement);
        });
    }

    createOnlineFriendElement(friend) {
        const div = document.createElement('div');
        div.className = 'friend-request';
        div.dataset.friendId = friend.id;
        
        div.innerHTML = `
            <div class="user-avatar" style="position: relative;">
                ${friend.avatar}
                <div class="online-status"></div>
            </div>
            <div class="friend-info">
                <h4>${friend.name}</h4>
                <p class="friend-mutual" style="color: var(--success);">
                    <i class="fas fa-circle" style="font-size: 8px;"></i> ${friend.status}
                </p>
                <div class="friend-actions">
                    <button class="btn btn-primary btn-sm message-btn" data-tooltip="Message">
                        <i class="fas fa-comment"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm call-btn" data-tooltip="Call">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="btn btn-secondary btn-sm video-btn" data-tooltip="Video">
                        <i class="fas fa-video"></i>
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        div.querySelector('.message-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.messageFriend(friend.id);
        });

        div.querySelector('.call-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.callFriend(friend.id);
        });

        div.querySelector('.video-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.videoCallFriend(friend.id);
        });

        return div;
    }

    // Friend request handling
    acceptFriendRequest(requestId) {
        const requestIndex = this.friendRequests.findIndex(r => r.id === requestId);
        if (requestIndex === -1) return;

        const request = this.friendRequests[requestIndex];
        
        // Add to friends list
        this.friends.push({
            ...request,
            online: Math.random() > 0.5,
            status: 'Just added'
        });

        // Remove from requests
        this.friendRequests.splice(requestIndex, 1);

        // Update UI
        this.renderFriendRequests();
        this.updateOnlineFriends();
        this.renderOnlineFriends();

        // Show notification
        this.app.notifications.success(
            'Friend added!',
            `You are now friends with ${request.name}`
        );

        // Update friend request badge
        this.updateRequestBadge();
    }

    declineFriendRequest(requestId) {
        const requestIndex = this.friendRequests.findIndex(r => r.id === requestId);
        if (requestIndex === -1) return;

        const request = this.friendRequests[requestIndex];
        this.friendRequests.splice(requestIndex, 1);

        // Update UI
        this.renderFriendRequests();

        // Show notification
        this.app.notifications.info(
            'Request declined',
            `${request.name}'s friend request was declined`
        );

        // Update friend request badge
        this.updateRequestBadge();
    }

    updateRequestBadge() {
        const badge = document.getElementById('messageBadge');
        if (badge) {
            const unreadRequests = this.friendRequests.length;
            badge.textContent = unreadRequests > 99 ? '99+' : unreadRequests;
            badge.style.display = unreadRequests > 0 ? 'flex' : 'none';
        }
    }

    // Friend actions
    messageFriend(friendId) {
        const friend = this.getFriendById(friendId);
        if (friend) {
            this.app.notifications.info('Messenger', `Opening chat with ${friend.name}...`);
            // In a real app, this would open the chat interface
        }
    }

    callFriend(friendId) {
        const friend = this.getFriendById(friendId);
        if (friend) {
            this.app.notifications.info('Call', `Calling ${friend.name}...`);
            // In a real app, this would initiate a voice call
        }
    }

    videoCallFriend(friendId) {
        const friend = this.getFriendById(friendId);
        if (friend) {
            this.app.notifications.info('Video Call', `Starting video call with ${friend.name}...`);
            // In a real app, this would initiate a video call
        }
    }

    // Friend profile
    showFriendProfile(friendId) {
        const friend = this.getFriendById(friendId);
        if (friend) {
            this.app.modals.open('friendProfile', { friendId });
        }
    }

    getFriendById(friendId) {
        return this.friends.find(f => f.id === friendId);
    }

    getFriendName(friendId) {
        const friend = this.getFriendById(friendId);
        return friend ? friend.name : null;
    }

    isFriendOnline(friendId) {
        const friend = this.getFriendById(friendId);
        return friend ? friend.online : false;
    }

    // Load all friend requests for modal
    loadAllFriendRequests() {
        return Promise.resolve([...this.friendRequests]);
    }

    showAllFriendRequests() {
        this.app.modals.open('friendRequests');
    }

    // Load friends for tagging
    loadFriendsForTagging() {
        return Promise.resolve(this.friends.map(friend => ({
            id: friend.id,
            name: friend.name,
            avatar: friend.avatar,
            online: friend.online
        })));
    }

    // Find new friends
    showFindFriends() {
        this.app.notifications.info('Find Friends', 'Showing friend suggestions...');
        
        // Create suggestions overlay
        const overlay = this.createFindFriendsOverlay();
        document.body.appendChild(overlay);
    }

    createFindFriendsOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'find-friends-overlay';
        
        const suggestions = this.generateFriendSuggestions();
        
        overlay.innerHTML = `
            <div class="find-friends-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> People You May Know</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="suggestions-grid">
                        ${suggestions.map(suggestion => `
                            <div class="suggestion-card" data-user-id="${suggestion.id}">
                                <div class="user-avatar">${suggestion.avatar}</div>
                                <div class="suggestion-info">
                                    <h4>${suggestion.name}</h4>
                                    <p class="mutual-friends">
                                        <i class="fas fa-user-friends"></i> 
                                        ${suggestion.mutual} mutual friends
                                    </p>
                                    <div class="suggestion-actions">
                                        <button class="btn btn-primary btn-sm add-friend-btn">
                                            <i class="fas fa-user-plus"></i> Add Friend
                                        </button>
                                        <button class="btn btn-secondary btn-sm remove-btn">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="closeFindFriends">
                        Close
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        overlay.querySelector('.close-modal').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.querySelector('#closeFindFriends').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.querySelectorAll('.add-friend-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.sendFriendRequest(suggestions[index].id);
                btn.closest('.suggestion-card').remove();
            });
        });

        overlay.querySelectorAll('.remove-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                btn.closest('.suggestion-card').remove();
            });
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        return overlay;
    }

    generateFriendSuggestions() {
        const names = [
            "Oliver Wilson", "Charlotte Brown", "Liam Martinez", "Ava Garcia",
            "Noah Rodriguez", "Isabella Lee", "Elijah Hernandez", "Mia King",
            "James Wright", "Sophia Lopez", "Benjamin Hill", "Amelia Scott",
            "Lucas Green", "Harper Adams", "Henry Baker", "Evelyn Nelson"
        ];

        return Array.from({ length: 6 }, (_, i) => ({
            id: 100 + i,
            name: names[i],
            avatar: this.utils.getInitials(names[i]),
            mutual: Math.floor(Math.random() * 10) + 1
        }));
    }

    sendFriendRequest(userId) {
        // Simulate sending friend request
        setTimeout(() => {
            this.app.notifications.success(
                'Friend request sent',
                'Your friend request has been sent'
            );
        }, 500);
    }

    // Get friend count
    getFriendCount() {
        return this.friends.length;
    }

    // Search friends
    searchFriends(query) {
        const searchTerm = query.toLowerCase();
        return this.friends.filter(friend =>
            friend.name.toLowerCase().includes(searchTerm)
        );
    }

    // Toggle friend status (online/offline) for demo
    toggleFriendStatus(friendId) {
        const friend = this.getFriendById(friendId);
        if (friend) {
            friend.online = !friend.online;
            friend.status = friend.online ? 'Active now' : 'Offline';
            this.updateOnlineFriends();
            this.renderOnlineFriends();
            return true;
        }
        return false;
    }

    // Remove friend
    removeFriend(friendId) {
        const friendIndex = this.friends.findIndex(f => f.id === friendId);
        if (friendIndex === -1) return false;

        const friend = this.friends[friendIndex];
        this.friends.splice(friendIndex, 1);
        
        this.updateOnlineFriends();
        this.renderOnlineFriends();
        
        this.app.notifications.info(
            'Friend removed',
            `You are no longer friends with ${friend.name}`
        );
        
        return true;
    }

    // Get mutual friends count
    getMutualFriendsCount(friendId) {
        const friend = this.getFriendById(friendId);
        return friend ? friend.mutual : 0;
    }

    // Export friends data
    exportFriends() {
        const data = {
            friends: this.friends.map(f => ({
                name: f.name,
                avatar: f.avatar,
                status: f.status,
                mutual: f.mutual
            })),
            total: this.friends.length,
            online: this.onlineFriends.length,
            exportDate: new Date().toISOString()
        };

        this.utils.downloadFile(
            JSON.stringify(data, null, 2),
            `friends-export-${new Date().toISOString().split('T')[0]}.json`,
            'application/json'
        );

        this.app.notifications.success(
            'Exported',
            'Friend list has been exported'
        );
    }
}

// Export
window.friends = new Friends(window.app);
