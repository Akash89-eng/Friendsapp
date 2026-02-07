// UI Components and Interactions
class UI {
    constructor(app) {
        this.app = app;
        this.utils = window.utils;
        this.initializeUI();
    }

    initializeUI() {
        this.cacheDOM();
        this.bindEvents();
        this.initializeTooltips();
        this.initializeAnimations();
    }

    cacheDOM() {
        // Cache frequently used DOM elements
        this.elements = {
            // Header
            header: document.querySelector('.header'),
            logo: document.querySelector('.logo'),
            searchInput: document.getElementById('searchInput'),
            searchButton: document.getElementById('searchButton'),
            navIcons: document.querySelectorAll('.nav-icon'),
            userMenu: document.getElementById('userMenu'),
            userAvatar: document.getElementById('userAvatar'),
            
            // Sidebar
            sidebar: document.querySelector('.sidebar'),
            menuItems: document.querySelectorAll('.menu-item'),
            
            // Main content
            postText: document.getElementById('postText'),
            postsFeed: document.getElementById('postsFeed'),
            fabBtn: document.getElementById('fabBtn'),
            
            // Right sidebar
            friendRequestsList: document.getElementById('friendRequestsList'),
            eventsList: document.getElementById('eventsList'),
            onlineFriends: document.getElementById('onlineFriends'),
            
            // Modals
            modals: {
                createPost: document.getElementById('createPostModal'),
                friendRequests: document.getElementById('friendRequestsModal'),
                tagFriends: document.getElementById('tagFriendsModal'),
                createEvent: document.getElementById('createEventModal'),
                imageViewer: document.getElementById('imageViewerModal')
            },
            
            // Buttons
            buttons: {
                createPost: document.getElementById('createPostBtn'),
                publishPost: document.getElementById('publishPostBtn'),
                viewAllRequests: document.getElementById('viewAllRequestsBtn'),
                tagFriends: document.getElementById('tagFriendsBtn'),
                createEvent: document.getElementById('createEventBtn'),
                fab: document.getElementById('fabBtn')
            },
            
            // Notification
            notification: document.getElementById('notification')
        };
    }

    bindEvents() {
        // Navigation
        this.elements.navIcons.forEach(icon => {
            icon.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // User menu
        this.elements.userMenu.addEventListener('click', () => this.showUserMenu());

        // Search
        this.elements.searchButton.addEventListener('click', () => this.performSearch());
        this.elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

        // Create post triggers
        this.elements.postText.addEventListener('click', () => this.showCreatePostModal());
        this.elements.fabBtn.addEventListener('click', () => this.showCreatePostModal());
        this.elements.buttons.createPost.addEventListener('click', () => this.showCreatePostModal());
        this.elements.buttons.fab.addEventListener('click', () => this.showCreatePostModal());

        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e));
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });

        // Sidebar menu items
        this.elements.menuItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleMenuItemClick(e));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Infinite scroll
        window.addEventListener('scroll', () => this.handleInfiniteScroll());

        // Window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    initializeTooltips() {
        // Initialize tooltips for elements with data-tooltip attribute
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => this.showTooltip(e));
            element.addEventListener('mouseleave', () => this.hideTooltip());
        });
    }

    initializeAnimations() {
        // Add animation classes to elements on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe elements that should animate
        document.querySelectorAll('.post, .friend-request, .event-item').forEach(el => {
            observer.observe(el);
        });
    }

    // Event Handlers
    handleNavClick(e) {
        e.preventDefault();
        const clickedIcon = e.currentTarget;
        const tooltip = clickedIcon.getAttribute('data-tooltip');
        
        // Update active state
        this.elements.navIcons.forEach(icon => icon.classList.remove('active'));
        clickedIcon.classList.add('active');
        
        // Handle specific navigation
        switch (tooltip) {
            case 'Home':
                this.app.posts.loadFeed();
                break;
            case 'Friends':
                this.app.friends.showFriendsList();
                break;
            case 'Messages':
                this.app.messages.showMessages();
                break;
            case 'Notifications':
                this.app.notifications.showNotifications();
                break;
            case 'Discover':
                this.app.posts.showDiscover();
                break;
        }
    }

    handleMenuItemClick(e) {
        e.preventDefault();
        const clickedItem = e.currentTarget;
        const text = clickedItem.querySelector('span').textContent;
        
        // Update active state
        this.elements.menuItems.forEach(item => item.classList.remove('active'));
        clickedItem.classList.add('active');
        
        // Handle navigation
        this.app.notifications.showToast(`Navigating to ${text}`, 'info');
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to publish post
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (this.isModalOpen('createPost')) {
                this.app.posts.publishPost();
            }
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
        
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.elements.searchInput.focus();
        }
        
        // Ctrl/Cmd + N for new post
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.showCreatePostModal();
        }
    }

    handleInfiniteScroll() {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        
        if (scrollPercentage > 80) {
            this.app.posts.loadMorePosts();
        }
    }

    handleResize() {
        // Handle responsive behavior
        if (window.innerWidth <= 992) {
            this.elements.sidebar.classList.add('mobile-hidden');
        } else {
            this.elements.sidebar.classList.remove('mobile-hidden');
        }
    }

    // Modal Management
    showModal(modalName) {
        const modal = this.elements.modals[modalName];
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.currentModal = modalName;
        }
    }

    closeModal(e) {
        if (e) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }
    }

    closeAllModals() {
        Object.values(this.elements.modals).forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
        this.currentModal = null;
    }

    isModalOpen(modalName) {
        const modal = this.elements.modals[modalName];
        return modal && modal.style.display === 'flex';
    }

    // UI Components
    showCreatePostModal() {
        this.showModal('createPost');
        document.getElementById('modalPostText').focus();
    }

    showUserMenu() {
        // Create user dropdown
        const dropdown = this.createUserDropdown();
        
        // Position and show dropdown
        const rect = this.elements.userMenu.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.top = `${rect.bottom + 8}px`;
        dropdown.style.right = `${window.innerWidth - rect.right}px`;
        
        document.body.appendChild(dropdown);
        
        // Close on outside click
        const closeDropdown = (e) => {
            if (!dropdown.contains(e.target) && !this.elements.userMenu.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        };
        
        setTimeout(() => document.addEventListener('click', closeDropdown));
    }

    createUserDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-item" data-action="profile">
                <i class="fas fa-user"></i> Your Profile
            </div>
            <div class="dropdown-item" data-action="settings">
                <i class="fas fa-cog"></i> Settings
            </div>
            <div class="dropdown-item" data-action="saved">
                <i class="fas fa-bookmark"></i> Saved
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-item" data-action="logout">
                <i class="fas fa-sign-out-alt"></i> Log Out
            </div>
        `;
        
        // Add click handlers
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                this.handleUserMenuAction(action);
                dropdown.remove();
            });
        });
        
        return dropdown;
    }

    handleUserMenuAction(action) {
        switch (action) {
            case 'profile':
                this.app.auth.showProfile();
                break;
            case 'settings':
                this.app.auth.showSettings();
                break;
            case 'saved':
                this.app.posts.showSavedPosts();
                break;
            case 'logout':
                this.app.auth.logout();
                break;
        }
    }

    // Tooltip System
    showTooltip(e) {
        const element = e.currentTarget;
        const tooltipText = element.getAttribute('data-tooltip');
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = tooltipText;
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'fixed';
        tooltip.style.top = `${rect.top - 40}px`;
        tooltip.style.left = `${rect.left + (rect.width / 2)}px`;
        tooltip.style.transform = 'translateX(-50%)';
        
        document.body.appendChild(tooltip);
        element.dataset.tooltipId = tooltip.id = `tooltip-${Date.now()}`;
    }

    hideTooltip() {
        const tooltips = document.querySelectorAll('.custom-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
    }

    // Loading States
    showLoading(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('loading');
            element.innerHTML = '<div class="loading-spinner"></div>';
        }
    }

    hideLoading(selector, originalContent) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.remove('loading');
            element.innerHTML = originalContent;
        }
    }

    // Search functionality
    performSearch() {
        const query = this.elements.searchInput.value.trim();
        if (query) {
            this.app.search.performSearch(query);
        }
    }

    // Update UI state
    updateNotificationBadge(count) {
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    updateMessageBadge(count) {
        const badge = document.getElementById('messageBadge');
        if (badge) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    updateUserAvatar(avatarUrl) {
        if (avatarUrl) {
            this.elements.userAvatar.style.backgroundImage = `url(${avatarUrl})`;
            this.elements.userAvatar.textContent = '';
        }
    }

    updateUserInfo(user) {
        const userName = document.querySelector('.user-name');
        if (userName) {
            userName.textContent = user.name;
        }
    }

    // Responsive helpers
    toggleSidebar() {
        this.elements.sidebar.classList.toggle('mobile-visible');
    }

    // DOM manipulation helpers
    createElement(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    appendTo(parent, child) {
        if (typeof parent === 'string') {
            parent = document.querySelector(parent);
        }
        if (parent && child) {
            parent.appendChild(child);
        }
    }

    // Cleanup
    destroy() {
        // Remove all event listeners
        this.elements.navIcons.forEach(icon => {
            icon.removeEventListener('click', this.handleNavClick);
        });
        
        window.removeEventListener('scroll', this.handleInfiniteScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ui = new UI(window.app);
});
