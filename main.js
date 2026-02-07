// Main Application Entry Point
class FriendsConnectApp {
    constructor() {
        // Initialize utilities first
        this.utils = window.utils || new Utils();
        
        // Initialize all modules
        this.auth = window.auth || new Auth(this);
        this.ui = window.ui || new UI(this);
        this.modals = window.modalSystem || new ModalSystem(this);
        this.notifications = window.notificationSystem || new NotificationSystem(this);
        this.posts = window.posts || new Posts(this);
        this.friends = window.friends || new Friends(this);
        this.messages = window.messages || new Messages(this);
        this.events = window.events || new Events(this);
        
        // App state
        this.state = {
            isInitialized: false,
            isLoading: false,
            currentPage: 'home',
            theme: 'dark',
            settings: {}
        };
        
        // Initialize app
        this.initialize();
    }

    async initialize() {
        console.log('🚀 FriendsConnect App Initializing...');
        
        // Show loading state
        this.showLoadingScreen();
        
        try {
            // Check authentication
            await this.checkAuthentication();
            
            // Load user data
            await this.loadUserData();
            
            // Initialize components
            await this.initializeComponents();
            
            // Load initial content
            await this.loadInitialContent();
            
            // Set up periodic updates
            this.setupPeriodicUpdates();
            
            // Initialize analytics (optional)
            this.initializeAnalytics();
            
            // App is ready
            this.state.isInitialized = true;
            console.log('✅ FriendsConnect App Ready!');
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Show welcome notification
            setTimeout(() => {
                this.notifications.success(
                    'Welcome to FriendsConnect!',
                    'Your social network is ready'
                );
            }, 1000);
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    showLoadingScreen() {
        // Create loading screen if not exists
        if (!document.getElementById('appLoading')) {
            const loadingScreen = document.createElement('div');
            loadingScreen.id = 'appLoading';
            loadingScreen.className = 'app-loading-screen';
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div class="loading-logo">
                        <i class="fas fa-sparkles"></i>
                    </div>
                    <h2>FriendsConnect</h2>
                    <p>Loading your social experience...</p>
                    <div class="loading-spinner"></div>
                </div>
            `;
            document.body.appendChild(loadingScreen);
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('appLoading');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }
    }

    async checkAuthentication() {
        // Check if user is authenticated
        if (!this.auth.isAuthenticated()) {
            console.log('👤 User not authenticated');
            // In a real app, you might redirect to login
            // For demo, we'll use demo data
            this.auth.loadDemoData();
        } else {
            console.log('👤 User authenticated:', this.auth.getUser()?.name);
        }
    }

    async loadUserData() {
        // Load additional user data if needed
        // This could include preferences, settings, etc.
        this.state.settings = this.loadSettings();
        this.state.theme = this.state.settings.theme || 'dark';
        
        // Apply theme
        this.applyTheme(this.state.theme);
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('friendsconnect_settings');
            return saved ? JSON.parse(saved) : {
                theme: 'dark',
                notifications: true,
                sounds: true,
                privacy: 'friends',
                language: 'en'
            };
        } catch (error) {
            console.error('Failed to load settings:', error);
            return {};
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('friendsconnect_settings', JSON.stringify(this.state.settings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        this.state.theme = theme;
        this.state.settings.theme = theme;
        this.saveSettings();
    }

    toggleTheme() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        
        this.notifications.info(
            'Theme changed',
            `Switched to ${newTheme} theme`
        );
    }

    async initializeComponents() {
        // Initialize all UI components
        await Promise.all([
            this.ui.initialize(),
            this.modals.initialize(),
            this.notifications.initialize(),
            this.posts.initialize(),
            this.friends.initialize(),
            this.messages.initialize(),
            this.events.initialize()
        ]);
    }

    async loadInitialContent() {
        // Load initial content for the current page
        switch (this.state.currentPage) {
            case 'home':
                await this.posts.loadPosts();
                await this.friends.loadDemoData();
                await this.events.loadDemoData();
                break;
            case 'profile':
                // Load profile data
                break;
            case 'messages':
                // Load messages
                break;
            case 'events':
                // Load events
                break;
        }
    }

    setupPeriodicUpdates() {
        // Update online status every minute
        setInterval(() => {
            this.updateOnlineStatus();
        }, 60000);

        // Check for new notifications every 2 minutes
        setInterval(() => {
            this.checkForUpdates();
        }, 120000);

        // Update friend statuses periodically (for demo)
        setInterval(() => {
            this.updateFriendStatuses();
        }, 30000);
    }

    updateOnlineStatus() {
        if (this.auth.isAuthenticated()) {
            // In a real app, this would ping the server
            console.log('🟢 Updating online status');
        }
    }

    checkForUpdates() {
        // Check for new notifications, messages, etc.
        this.notifications.checkForNewNotifications();
        
        // Update badges
        this.updateAllBadges();
    }

    updateFriendStatuses() {
        // Randomly toggle friend status for demo
        this.friends.friends.forEach(friend => {
            if (Math.random() > 0.8) { // 20% chance to change status
                this.friends.toggleFriendStatus(friend.id);
            }
        });
    }

    updateAllBadges() {
        // Update notification badge
        this.notifications.updateBadge();
        
        // Update message badge
        this.messages.updateBadge();
        
        // Update friend request badge
        this.friends.updateRequestBadge();
    }

    initializeAnalytics() {
        // Initialize analytics if needed
        // This is where you would add Google Analytics, etc.
        console.log('📊 Analytics initialized');
    }

    handleInitializationError(error) {
        this.hideLoadingScreen();
        
        // Show error message
        const errorScreen = document.createElement('div');
        errorScreen.className = 'error-screen';
        errorScreen.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Something went wrong</h2>
                <p>${error.message || 'Failed to load the application'}</p>
                <button class="btn btn-primary" id="retryBtn">
                    <i class="fas fa-redo"></i> Retry
                </button>
                <button class="btn btn-secondary" id="reportBtn">
                    <i class="fas fa-bug"></i> Report Issue
                </button>
            </div>
        `;
        
        document.body.innerHTML = '';
        document.body.appendChild(errorScreen);
        
        // Add retry functionality
        document.getElementById('retryBtn').addEventListener('click', () => {
            window.location.reload();
        });
        
        document.getElementById('reportBtn').addEventListener('click', () => {
            this.reportError(error);
        });
    }

    reportError(error) {
        const errorDetails = {
            timestamp: new Date().toISOString(),
            error: error.toString(),
            stack: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('Error reported:', errorDetails);
        
        this.notifications.success(
            'Error reported',
            'Thank you for reporting this issue'
        );
    }

    // Navigation
    navigateTo(page, data = {}) {
        this.state.currentPage = page;
        
        // Update active navigation
        this.updateNavigation(page);
        
        // Load page content
        this.loadPageContent(page, data);
    }

    updateNavigation(page) {
        // Update active state in navigation
        const navItems = document.querySelectorAll('[data-page]');
        navItems.forEach(item => {
            if (item.dataset.page === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    async loadPageContent(page, data) {
        this.showLoadingState();
        
        try {
            switch (page) {
                case 'home':
                    await this.loadHomePage(data);
                    break;
                case 'profile':
                    await this.loadProfilePage(data);
                    break;
                case 'friends':
                    await this.loadFriendsPage(data);
                    break;
                case 'messages':
                    await this.loadMessagesPage(data);
                    break;
                case 'events':
                    await this.loadEventsPage(data);
                    break;
                case 'notifications':
                    await this.loadNotificationsPage(data);
                    break;
                case 'settings':
                    await this.loadSettingsPage(data);
                    break;
                default:
                    this.loadNotFoundPage();
            }
        } catch (error) {
            console.error(`Failed to load page ${page}:`, error);
            this.notifications.error('Error', `Failed to load ${page} page`);
        } finally {
            this.hideLoadingState();
        }
    }

    async loadHomePage(data) {
        // Load home page content
        this.posts.loadPosts();
        this.events.renderEvents();
    }

    async loadProfilePage(data) {
        // Load profile page content
        // This would show user profile or other user's profile
    }

    async loadFriendsPage(data) {
        // Load friends page content
        this.friends.showFindFriends();
    }

    async loadMessagesPage(data) {
        // Load messages page content
        this.messages.showMessages();
    }

    async loadEventsPage(data) {
        // Load events page content
        this.events.showAllEvents();
    }

    async loadNotificationsPage(data) {
        // Load notifications page content
        this.notifications.showAllNotifications();
    }

    async loadSettingsPage(data) {
        // Load settings page content
        this.showSettingsModal();
    }

    loadNotFoundPage() {
        // Show 404 page
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="not-found">
                    <i class="fas fa-map-signs"></i>
                    <h2>Page Not Found</h2>
                    <p>The page you're looking for doesn't exist.</p>
                    <button class="btn btn-primary" onclick="app.navigateTo('home')">
                        <i class="fas fa-home"></i> Go Home
                    </button>
                </div>
            `;
        }
    }

    showLoadingState() {
        this.state.isLoading = true;
        // Show loading indicator
        const loader = document.createElement('div');
        loader.id = 'pageLoader';
        loader.className = 'page-loader';
        loader.innerHTML = '<div class="loading-spinner"></div>';
        document.querySelector('.main-content')?.prepend(loader);
    }

    hideLoadingState() {
        this.state.isLoading = false;
        const loader = document.getElementById('pageLoader');
        if (loader) {
            loader.remove();
        }
    }

    showSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-cog"></i> Settings</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="settings-section">
                        <h4>Appearance</h4>
                        <div class="setting-item">
                            <span>Theme</span>
                            <div class="theme-switcher">
                                <button class="btn btn-sm ${this.state.theme === 'light' ? 'active' : ''}" 
                                        onclick="app.applyTheme('light')">
                                    Light
                                </button>
                                <button class="btn btn-sm ${this.state.theme === 'dark' ? 'active' : ''}" 
                                        onclick="app.applyTheme('dark')">
                                    Dark
                                </button>
                                <button class="btn btn-sm ${this.state.theme === 'auto' ? 'active' : ''}" 
                                        onclick="app.applyTheme('auto')">
                                    Auto
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h4>Notifications</h4>
                        <div class="setting-item">
                            <span>Push Notifications</span>
                            <label class="switch">
                                <input type="checkbox" ${this.state.settings.notifications ? 'checked' : ''}
                                       onchange="app.toggleSetting('notifications', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="setting-item">
                            <span>Sounds</span>
                            <label class="switch">
                                <input type="checkbox" ${this.state.settings.sounds ? 'checked' : ''}
                                       onchange="app.toggleSetting('sounds', this.checked)">
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="settings-section">
                        <h4>Privacy</h4>
                        <div class="setting-item">
                            <span>Default Post Privacy</span>
                            <select class="form-control" 
                                    onchange="app.toggleSetting('privacy', this.value)">
                                <option value="public" ${this.state.settings.privacy === 'public' ? 'selected' : ''}>
                                    Public
                                </option>
                                <option value="friends" ${this.state.settings.privacy === 'friends' ? 'selected' : ''}>
                                    Friends Only
                                </option>
                                <option value="onlyme" ${this.state.settings.privacy === 'onlyme' ? 'selected' : ''}>
                                    Only Me
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.settings-modal').remove()">
                        Close
                    </button>
                    <button class="btn btn-primary" onclick="app.saveAllSettings()">
                        Save Changes
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    toggleSetting(key, value) {
        this.state.settings[key] = value;
    }

    saveAllSettings() {
        this.saveSettings();
        this.notifications.success('Settings saved', 'Your preferences have been updated');
        document.querySelector('.settings-modal')?.remove();
    }

    // Search functionality
    performSearch(query) {
        if (!query.trim()) return;
        
        // Search across different modules
        const results = {
            posts: this.posts.searchEvents(query),
            friends: this.friends.searchFriends(query),
            events: this.events.searchEvents(query)
        };
        
        // Show search results
        this.showSearchResults(results, query);
    }

    showSearchResults(results, query) {
        const modal = document.createElement('div');
        modal.className = 'search-results-modal';
        
        const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Search Results for "${query}"</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="search-stats">
                        Found ${totalResults} results
                    </div>
                    <div class="search-tabs">
                        <button class="tab-btn active" data-tab="all">All (${totalResults})</button>
                        <button class="tab-btn" data-tab="posts">Posts (${results.posts.length})</button>
                        <button class="tab-btn" data-tab="friends">Friends (${results.friends.length})</button>
                        <button class="tab-btn" data-tab="events">Events (${results.events.length})</button>
                    </div>
                    <div class="search-results" id="searchResults">
                        ${this.renderSearchResults(results, 'all')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add tab switching
        modal.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const tab = e.target.dataset.tab;
                modal.querySelector('#searchResults').innerHTML = this.renderSearchResults(results, tab);
            });
        });
        
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderSearchResults(results, tab) {
        if (tab === 'all') {
            return `
                ${results.friends.length > 0 ? `
                    <div class="results-section">
                        <h4>Friends</h4>
                        ${results.friends.map(friend => `
                            <div class="search-result-item friend-result">
                                <div class="user-avatar">${friend.avatar}</div>
                                <div class="result-info">
                                    <h5>${friend.name}</h5>
                                    <span class="result-meta">${friend.mutual} mutual friends</span>
                                </div>
                                <button class="btn btn-primary btn-sm" onclick="app.friends.messageFriend(${friend.id})">
                                    Message
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${results.posts.length > 0 ? `
                    <div class="results-section">
                        <h4>Posts</h4>
                        ${results.posts.map(post => `
                            <div class="search-result-item post-result">
                                <div class="post-preview">
                                    <h5>${post.text.substring(0, 100)}...</h5>
                                    <span class="result-meta">By ${post.author} • ${post.time}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                ${results.events.length > 0 ? `
                    <div class="results-section">
                        <h4>Events</h4>
                        ${results.events.map(event => `
                            <div class="search-result-item event-result">
                                <div class="event-preview">
                                    <h5>${event.title}</h5>
                                    <span class="result-meta">
                                        ${event.date} • ${event.location} • ${event.attendees.length} attending
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            `;
        } else {
            const items = results[tab];
            if (items.length === 0) {
                return `<div class="no-results">No ${tab} found</div>`;
            }
            
            // Return results for specific tab
            // Implementation depends on tab type
            return items.map(item => this.renderSearchResultItem(item, tab)).join('');
        }
    }

    renderSearchResultItem(item, type) {
        // Render individual search result item based on type
        switch (type) {
            case 'friends':
                return `
                    <div class="search-result-item friend-result">
                        <div class="user-avatar">${item.avatar}</div>
                        <div class="result-info">
                            <h5>${item.name}</h5>
                            <span class="result-meta">${item.mutual} mutual friends</span>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="app.friends.messageFriend(${item.id})">
                            Message
                        </button>
                    </div>
                `;
            case 'posts':
                return `
                    <div class="search-result-item post-result">
                        <div class="post-preview">
                            <h5>${item.text.substring(0, 100)}...</h5>
                            <span class="result-meta">By ${item.author} • ${item.time}</span>
                        </div>
                    </div>
                `;
            case 'events':
                return `
                    <div class="search-result-item event-result">
                        <div class="event-preview">
                            <h5>${item.title}</h5>
                            <span class="result-meta">
                                ${item.date} • ${item.location} • ${item.attendees.length} attending
                            </span>
                        </div>
                    </div>
                `;
            default:
                return '';
        }
    }

    // App lifecycle methods
    pauseApp() {
        // Save state before pause
        this.state.lastActive = new Date().toISOString();
        console.log('⏸️ App paused');
    }

    resumeApp() {
        // Check for updates since last active
        const lastActive = new Date(this.state.lastActive);
        const now = new Date();
        const minutesInactive = (now - lastActive) / 60000;
        
        if (minutesInactive > 5) {
            // Refresh data if inactive for more than 5 minutes
            this.checkForUpdates();
        }
        
        console.log('▶️ App resumed');
    }

    // Cleanup
    destroy() {
        // Clean up all event listeners and resources
        this.ui.destroy();
        
        // Save state
        this.saveSettings();
        
        console.log('🧹 App cleaned up');
    }

    // Global error handler
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.notifications.error(
                'App Error',
                'Something went wrong. Please try again.'
            );
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.notifications.error(
                'Promise Error',
                'An unexpected error occurred.'
            );
        });
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.app = new FriendsConnectApp();
    
    // Make app available globally for debugging
    console.log('🌐 FriendsConnect App Loaded');
    console.log('Type "app" in console to access the app instance');
    
    // Setup global error handling
    window.app.setupGlobalErrorHandler();
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            window.app.pauseApp();
        } else {
            window.app.resumeApp();
        }
    });
    
    // Handle beforeunload
    window.addEventListener('beforeunload', () => {
        window.app.destroy();
    });
});

// Make app modules available globally for HTML onclick handlers
window.FriendsConnectApp = FriendsConnectApp;
