// Authentication System
class Auth {
    constructor(app) {
        this.app = app;
        this.utils = window.utils;
        this.currentUser = null;
        this.token = null;
        this.initialize();
    }

    initialize() {
        this.loadFromStorage();
        this.setupAuthElements();
    }

    loadFromStorage() {
        try {
            const savedUser = localStorage.getItem('friendsconnect_user');
            const savedToken = localStorage.getItem('friendsconnect_token');
            
            if (savedUser && savedToken) {
                this.currentUser = JSON.parse(savedUser);
                this.token = savedToken;
                this.updateUI();
                return true;
            }
        } catch (error) {
            console.error('Failed to load auth from storage:', error);
            this.clearAuth();
        }
        return false;
    }

    saveToStorage() {
        try {
            if (this.currentUser) {
                localStorage.setItem('friendsconnect_user', JSON.stringify(this.currentUser));
            }
            if (this.token) {
                localStorage.setItem('friendsconnect_token', this.token);
            }
        } catch (error) {
            console.error('Failed to save auth to storage:', error);
        }
    }

    clearAuth() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('friendsconnect_user');
        localStorage.removeItem('friendsconnect_token');
        this.updateUI();
    }

    setupAuthElements() {
        // Login form (if exists)
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form (if exists)
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Logout button
        const logoutBtn = document.querySelector('[data-action="logout"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    updateUI() {
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.querySelector('.user-name');
        const userStatus = document.querySelector('.user-status');

        if (this.isAuthenticated()) {
            // Update user info in UI
            if (userAvatar) {
                if (this.currentUser.avatarUrl) {
                    userAvatar.style.backgroundImage = `url(${this.currentUser.avatarUrl})`;
                    userAvatar.textContent = '';
                } else {
                    userAvatar.style.backgroundImage = '';
                    userAvatar.textContent = this.utils.getInitials(this.currentUser.name);
                }
            }

            if (userName) {
                userName.textContent = this.currentUser.name;
            }

            if (userStatus) {
                const statusDot = userStatus.querySelector('.status-dot');
                if (statusDot) {
                    statusDot.className = 'status-dot';
                    statusDot.classList.add(this.currentUser.status === 'Online' ? 'online' : 'offline');
                }
            }

            // Show authenticated UI
            document.body.classList.add('authenticated');
            document.body.classList.remove('guest');
        } else {
            // Show guest UI
            document.body.classList.add('guest');
            document.body.classList.remove('authenticated');
        }
    }

    isAuthenticated() {
        return !!this.currentUser && !!this.token;
    }

    // Login handler
    async handleLogin() {
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;

        if (!email || !password) {
            this.app.notifications.error('Error', 'Please enter email and password');
            return;
        }

        if (!this.utils.isValidEmail(email)) {
            this.app.notifications.error('Error', 'Please enter a valid email');
            return;
        }

        // Show loading
        const loginBtn = document.querySelector('#loginForm button[type="submit"]');
        const restoreButton = loginBtn ? this.utils.showButtonLoading(loginBtn) : null;

        try {
            // Simulate API call
            await this.simulateLoginAPI(email, password);
            
            this.app.notifications.success('Welcome back!', 'Successfully logged in');
            
            // Redirect or update UI
            setTimeout(() => {
                window.location.href = '/feed.html'; // Or update UI in-place
            }, 1000);

        } catch (error) {
            this.app.notifications.error('Login failed', error.message);
        } finally {
            if (restoreButton) restoreButton();
        }
    }

    async simulateLoginAPI(email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock validation
        if (email === 'demo@example.com' && password === 'password123') {
            this.currentUser = {
                id: 1,
                name: "John Smith",
                email: "demo@example.com",
                avatar: "JS",
                avatarUrl: null,
                status: "Online",
                bio: "Software developer and tech enthusiast",
                location: "San Francisco, CA",
                website: "https://example.com",
                joinedDate: "2023-01-15",
                friendsCount: 245,
                postsCount: 42
            };
            
            this.token = 'demo-token-' + Date.now();
            this.saveToStorage();
            this.updateUI();
            return;
        }

        throw new Error('Invalid email or password');
    }

    // Register handler
    async handleRegister() {
        const name = document.getElementById('registerName')?.value;
        const email = document.getElementById('registerEmail')?.value;
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('registerConfirmPassword')?.value;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            this.app.notifications.error('Error', 'Please fill all fields');
            return;
        }

        if (!this.utils.isValidEmail(email)) {
            this.app.notifications.error('Error', 'Please enter a valid email');
            return;
        }

        const passwordErrors = this.utils.validatePassword(password);
        if (passwordErrors.length > 0) {
            this.app.notifications.error('Password Error', passwordErrors.join(', '));
            return;
        }

        if (password !== confirmPassword) {
            this.app.notifications.error('Error', 'Passwords do not match');
            return;
        }

        // Show loading
        const registerBtn = document.querySelector('#registerForm button[type="submit"]');
        const restoreButton = registerBtn ? this.utils.showButtonLoading(registerBtn) : null;

        try {
            await this.simulateRegisterAPI(name, email, password);
            this.app.notifications.success('Account created!', 'Welcome to FriendsConnect');
            
            // Redirect to login or feed
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);

        } catch (error) {
            this.app.notifications.error('Registration failed', error.message);
        } finally {
            if (restoreButton) restoreButton();
        }
    }

    async simulateRegisterAPI(name, email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if email already exists (in demo)
        const existingUser = localStorage.getItem('friendsconnect_user');
        if (existingUser) {
            const user = JSON.parse(existingUser);
            if (user.email === email) {
                throw new Error('Email already registered');
            }
        }

        // Create new user
        this.currentUser = {
            id: Date.now(),
            name,
            email,
            avatar: this.utils.getInitials(name),
            avatarUrl: null,
            status: "Online",
            bio: "",
            location: "",
            website: "",
            joinedDate: new Date().toISOString().split('T')[0],
            friendsCount: 0,
            postsCount: 0
        };

        this.token = 'demo-token-' + Date.now();
        this.saveToStorage();
        this.updateUI();
    }

    // Logout
    logout() {
        this.clearAuth();
        this.app.notifications.info('Logged out', 'You have been logged out successfully');
        
        // Redirect to login page
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
    }

    // Update profile
    async updateProfile(profileData) {
        if (!this.isAuthenticated()) {
            this.app.notifications.error('Error', 'Please login to update profile');
            return false;
        }

        try {
            // Validate profile data
            if (profileData.email && !this.utils.isValidEmail(profileData.email)) {
                throw new Error('Invalid email format');
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));

            // Update user data
            this.currentUser = { ...this.currentUser, ...profileData };
            this.saveToStorage();
            this.updateUI();

            this.app.notifications.success('Profile updated', 'Your profile has been updated successfully');
            return true;

        } catch (error) {
            this.app.notifications.error('Update failed', error.message);
            return false;
        }
    }

    // Upload profile picture
    async uploadProfilePicture(file) {
        if (!this.isAuthenticated()) {
            this.app.notifications.error('Error', 'Please login to upload picture');
            return false;
        }

        if (!file || !file.type.startsWith('image/')) {
            this.app.notifications.error('Error', 'Please select a valid image file');
            return false;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.app.notifications.error('Error', 'Image size should be less than 5MB');
            return false;
        }

        // Show loading
        this.app.notifications.info('Uploading', 'Uploading profile picture...');

        try {
            // Simulate upload
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create object URL for preview (in real app, this would be uploaded to server)
            const objectUrl = URL.createObjectURL(file);
            
            this.currentUser.avatarUrl = objectUrl;
            this.saveToStorage();
            this.updateUI();

            this.app.notifications.success('Success', 'Profile picture updated');
            return true;

        } catch (error) {
            this.app.notifications.error('Upload failed', error.message);
            return false;
        }
    }

    // Change password
    async changePassword(currentPassword, newPassword) {
        if (!this.isAuthenticated()) {
            this.app.notifications.error('Error', 'Please login to change password');
            return false;
        }

        // Validate new password
        const passwordErrors = this.utils.validatePassword(newPassword);
        if (passwordErrors.length > 0) {
            this.app.notifications.error('Password Error', passwordErrors.join(', '));
            return false;
        }

        // Simulate API call
        this.app.notifications.info('Processing', 'Changing password...');

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // In demo, accept any current password
            this.app.notifications.success('Success', 'Password changed successfully');
            return true;

        } catch (error) {
            this.app.notifications.error('Failed', 'Could not change password');
            return false;
        }
    }

    // Forgot password
    async forgotPassword(email) {
        if (!this.utils.isValidEmail(email)) {
            this.app.notifications.error('Error', 'Please enter a valid email');
            return false;
        }

        this.app.notifications.info('Processing', 'Sending reset instructions...');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            this.app.notifications.success('Check your email', 'Password reset instructions have been sent');
            return true;

        } catch (error) {
            this.app.notifications.error('Failed', 'Could not send reset email');
            return false;
        }
    }

    // Get current user data
    getUser() {
        return this.currentUser ? { ...this.currentUser } : null;
    }

    // Check if user is online
    isOnline() {
        return this.currentUser?.status === 'Online';
    }

    // Set user status
    setStatus(status) {
        if (this.currentUser && ['Online', 'Away', 'Offline'].includes(status)) {
            this.currentUser.status = status;
            this.saveToStorage();
            this.updateUI();
            return true;
        }
        return false;
    }

    // Demo data for testing
    loadDemoData() {
        this.currentUser = {
            id: 1,
            name: "John Smith",
            email: "john@example.com",
            avatar: "JS",
            avatarUrl: null,
            status: "Online",
            bio: "Software developer | Tech enthusiast | Photographer",
            location: "San Francisco, CA",
            website: "https://portfolio.johnsmith.com",
            joinedDate: "2022-06-15",
            friendsCount: 245,
            postsCount: 42,
            followingCount: 156,
            followersCount: 312,
            notificationsCount: 5,
            messagesCount: 3
        };
        
        this.token = 'demo-token-' + Date.now();
        this.saveToStorage();
        this.updateUI();
    }

    // Get authentication headers for API calls
    getAuthHeaders() {
        if (this.token) {
            return {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            };
        }
        return {
            'Content-Type': 'application/json'
        };
    }
}

// Export
window.auth = new Auth(window.app);
