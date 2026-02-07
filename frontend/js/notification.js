// Notification System
class NotificationSystem {
    constructor(app) {
        this.app = app;
        this.utils = window.utils;
        this.notifications = [];
        this.unreadCount = 0;
        this.initialize();
    }

    initialize() {
        this.elements = {
            notification: document.getElementById('notification'),
            notificationIcon: document.getElementById('notificationIcon'),
            notificationTitle: document.getElementById('notificationTitle'),
            notificationMessage: document.getElementById('notificationMessage'),
            notificationBadge: document.getElementById('notificationBadge')
        };

        this.setupEventListeners();
        this.loadNotifications();
        this.startPolling();
    }

    setupEventListeners() {
        // Close notification on click
        if (this.elements.notification) {
            this.elements.notification.addEventListener('click', () => {
                this.hideNotification();
            });
        }

        // Notification bell click
        const notificationBtn = document.getElementById('notificationsBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotificationsPanel();
            });
        }
    }

    // Show notification toast
    show(title, message, type = 'success', duration = 4000) {
        const { notification, notificationIcon, notificationTitle, notificationMessage } = this.elements;
        
        if (!notification) return;

        // Update content
        notificationTitle.textContent = title;
        notificationMessage.textContent = message;

        // Set type-specific styles
        notification.className = 'notification';
        notification.classList.add(type);

        // Set icon based on type
        let iconClass = 'fas fa-check-circle';
        switch (type) {
            case 'error':
                iconClass = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                iconClass = 'fas fa-exclamation-triangle';
                break;
            case 'info':
                iconClass = 'fas fa-info-circle';
                break;
        }
        notificationIcon.className = iconClass;

        // Show notification
        notification.style.display = 'block';
        notification.classList.add('show');

        // Auto-hide
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification();
            }, duration);
        }

        // Log to console in development
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);

        // Store notification
        this.addToHistory({
            id: this.utils.generateId(),
            title,
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        });

        // Update badge if it's an important notification
        if (type !== 'success') {
            this.incrementUnreadCount();
        }
    }

    hideNotification() {
        const { notification } = this.elements;
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }
    }

    // Push notification (for system notifications)
    pushNotification(data) {
        const { title, body, icon, tag } = data;
        
        // Show in-app notification
        this.show(title, body, 'info');

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon, tag });
        }

        // Play sound if enabled
        this.playNotificationSound();
    }

    // Browser notification permission
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            this.show('Notifications not supported', 'Your browser does not support notifications', 'warning');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            this.show('Notifications blocked', 'Please enable notifications in your browser settings', 'warning');
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    // Sound notification
    playNotificationSound() {
        // Create audio context for notification sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('Could not play notification sound:', error);
        }
    }

    // Notification history management
    addToHistory(notification) {
        this.notifications.unshift(notification);
        if (this.notifications.length > 100) {
            this.notifications.pop();
        }
        this.saveToLocalStorage();
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.decrementUnreadCount();
            this.saveToLocalStorage();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(notification => {
            if (!notification.read) {
                notification.read = true;
            }
        });
        this.unreadCount = 0;
        this.updateBadge();
        this.saveToLocalStorage();
    }

    // Unread count management
    incrementUnreadCount() {
        this.unreadCount++;
        this.updateBadge();
    }

    decrementUnreadCount() {
        if (this.unreadCount > 0) {
            this.unreadCount--;
            this.updateBadge();
        }
    }

    updateBadge() {
        const { notificationBadge } = this.elements;
        if (notificationBadge) {
            notificationBadge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            notificationBadge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
            
            // Add animation for new notifications
            if (this.unreadCount > 0) {
                notificationBadge.classList.add('pulse');
            } else {
                notificationBadge.classList.remove('pulse');
            }
        }
    }

    // Load/save from localStorage
    loadNotifications() {
        try {
            const saved = localStorage.getItem('friendsconnect_notifications');
            if (saved) {
                this.notifications = JSON.parse(saved);
                this.unreadCount = this.notifications.filter(n => !n.read).length;
                this.updateBadge();
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('friendsconnect_notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Failed to save notifications:', error);
        }
    }

    // Show notifications panel
    showNotificationsPanel() {
        // Mark all as read when opening panel
        this.markAllAsRead();

        // Create notifications panel
        const panel = this.createNotificationsPanel();
        
        // Position panel near notification bell
        const bellBtn = document.getElementById('notificationsBtn');
        if (bellBtn) {
            const rect = bellBtn.getBoundingClientRect();
            panel.style.position = 'fixed';
            panel.style.top = `${rect.bottom + 8}px`;
            panel.style.right = `${window.innerWidth - rect.right}px`;
        }

        document.body.appendChild(panel);

        // Close on outside click
        const closePanel = (e) => {
            if (!panel.contains(e.target) && !bellBtn.contains(e.target)) {
                panel.remove();
                document.removeEventListener('click', closePanel);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closePanel);
        });
    }

    createNotificationsPanel() {
        const panel = document.createElement('div');
        panel.className = 'notifications-panel';

        const header = document.createElement('div');
        header.className = 'notifications-header';
        header.innerHTML = `
            <h4><i class="fas fa-bell"></i> Notifications</h4>
            <button class="btn btn-sm btn-secondary" id="markAllReadBtn">
                Mark all as read
            </button>
        `;

        const list = document.createElement('div');
        list.className = 'notifications-list';

        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                </div>
            `;
        } else {
            this.notifications.slice(0, 10).forEach(notification => {
                const item = this.createNotificationItem(notification);
                list.appendChild(item);
            });
        }

        const footer = document.createElement('div');
        footer.className = 'notifications-footer';
        footer.innerHTML = `
            <a href="#" class="view-all-link">View all notifications</a>
        `;

        panel.appendChild(header);
        panel.appendChild(list);
        panel.appendChild(footer);

        // Add event listeners
        panel.querySelector('#markAllReadBtn').addEventListener('click', () => {
            this.markAllAsRead();
            panel.remove();
        });

        panel.querySelector('.view-all-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAllNotifications();
            panel.remove();
        });

        return panel;
    }

    createNotificationItem(notification) {
        const item = document.createElement('div');
        item.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        item.dataset.notificationId = notification.id;

        const iconClass = this.getNotificationIcon(notification.type);
        const timeAgo = this.utils.formatRelativeTime(notification.timestamp);

        item.innerHTML = `
            <div class="notification-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-body">${notification.message}</div>
                <div class="notification-time">${timeAgo}</div>
            </div>
            ${!notification.read ? '<div class="unread-dot"></div>' : ''}
        `;

        item.addEventListener('click', () => {
            this.handleNotificationClick(notification);
            if (!notification.read) {
                this.markAsRead(notification.id);
                item.classList.remove('unread');
                item.classList.add('read');
                item.querySelector('.unread-dot')?.remove();
            }
        });

        return item;
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'like': return 'fas fa-heart';
            case 'comment': return 'fas fa-comment';
            case 'friend': return 'fas fa-user-plus';
            case 'share': return 'fas fa-share';
            case 'mention': return 'fas fa-at';
            case 'event': return 'fas fa-calendar';
            case 'warning': return 'fas fa-exclamation-triangle';
            case 'error': return 'fas fa-exclamation-circle';
            default: return 'fas fa-bell';
        }
    }

    handleNotificationClick(notification) {
        // Handle notification click based on type
        switch (notification.type) {
            case 'like':
            case 'comment':
            case 'share':
                // Navigate to post
                if (notification.postId) {
                    this.app.posts.navigateToPost(notification.postId);
                }
                break;
            case 'friend':
                // Navigate to friend request
                this.app.friends.showFriendRequests();
                break;
            case 'mention':
                // Navigate to mentioned post/comment
                break;
            case 'event':
                // Navigate to event
                if (notification.eventId) {
                    this.app.events.navigateToEvent(notification.eventId);
                }
                break;
        }
    }

    showAllNotifications() {
        // Create full-screen notifications view
        const overlay = document.createElement('div');
        overlay.className = 'notifications-overlay';

        const modal = document.createElement('div');
        modal.className = 'notifications-modal';

        modal.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-bell"></i> All Notifications</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="notifications-tabs">
                    <button class="tab-btn active" data-tab="all">All</button>
                    <button class="tab-btn" data-tab="unread">Unread</button>
                    <button class="tab-btn" data-tab="mentions">Mentions</button>
                </div>
                <div id="notificationsContainer" class="notifications-container"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="clearAllNotifications">Clear All</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Load notifications
        this.renderAllNotifications(modal.querySelector('#notificationsContainer'));

        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            overlay.remove();
        });

        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterNotifications(e.target.dataset.tab, modal.querySelector('#notificationsContainer'));
            });
        });

        modal.querySelector('#clearAllNotifications').addEventListener('click', () => {
            this.clearAllNotifications();
            overlay.remove();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    renderAllNotifications(container) {
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <h4>No notifications</h4>
                    <p>You're all caught up!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        this.notifications.forEach(notification => {
            const item = this.createNotificationItem(notification);
            container.appendChild(item);
        });
    }

    filterNotifications(filter, container) {
        let filteredNotifications = this.notifications;
        
        switch (filter) {
            case 'unread':
                filteredNotifications = this.notifications.filter(n => !n.read);
                break;
            case 'mentions':
                filteredNotifications = this.notifications.filter(n => n.type === 'mention');
                break;
        }

        container.innerHTML = '';
        if (filteredNotifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-filter"></i>
                    <p>No ${filter} notifications</p>
                </div>
            `;
        } else {
            filteredNotifications.forEach(notification => {
                const item = this.createNotificationItem(notification);
                container.appendChild(item);
            });
        }
    }

    clearAllNotifications() {
        this.notifications = [];
        this.unreadCount = 0;
        this.updateBadge();
        this.saveToLocalStorage();
        this.show('Notifications cleared', 'All notifications have been removed', 'success');
    }

    // Polling for new notifications (simulated)
    startPolling() {
        setInterval(() => {
            this.checkForNewNotifications();
        }, 30000); // Check every 30 seconds
    }

    checkForNewNotifications() {
        // In a real app, this would make an API call
        // For demo, we'll simulate occasional notifications
        if (Math.random() < 0.1) { // 10% chance
            const notifications = [
                { title: 'New friend request', message: 'Someone wants to connect with you', type: 'friend' },
                { title: 'Post liked', message: 'Someone liked your recent post', type: 'like' },
                { title: 'Event reminder', message: 'You have an event starting soon', type: 'event' }
            ];
            
            const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
            this.pushNotification({
                title: randomNotification.title,
                body: randomNotification.message,
                icon: '/assets/logo.png',
                tag: 'demo-notification'
            });
        }
    }

    // Quick notification shortcuts
    success(title, message) {
        this.show(title, message, 'success');
    }

    error(title, message) {
        this.show(title, message, 'error');
    }

    warning(title, message) {
        this.show(title, message, 'warning');
    }

    info(title, message) {
        this.show(title, message, 'info');
    }
}

// Export
window.notificationSystem = new NotificationSystem(window.app);
