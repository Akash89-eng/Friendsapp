// Utility Functions for FriendsConnect

class Utils {
    constructor() {
        this.debounceTimers = {};
    }

    // Format numbers with K/M/B
    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    // Format date to relative time
    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffWeek = Math.floor(diffDay / 7);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffDay / 365);

        if (diffSec < 60) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;
        if (diffWeek < 4) return `${diffWeek}w ago`;
        if (diffMonth < 12) return `${diffMonth}mo ago`;
        return `${diffYear}y ago`;
    }

    // Debounce function for search inputs
    debounce(func, wait, id) {
        if (this.debounceTimers[id]) {
            clearTimeout(this.debounceTimers[id]);
        }
        this.debounceTimers[id] = setTimeout(func, wait);
    }

    // Get random color for avatars
    getRandomColor() {
        const colors = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
            '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Generate initials from name
    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    // Validate email
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Validate password strength
    validatePassword(password) {
        const errors = [];
        if (password.length < 8) errors.push('Must be at least 8 characters');
        if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
        if (!/[0-9]/.test(password)) errors.push('Must contain number');
        if (!/[@$!%*?&]/.test(password)) errors.push('Must contain special character');
        return errors;
    }

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Truncate text with ellipsis
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    // Parse query parameters
    getQueryParams() {
        const params = {};
        window.location.search.substr(1).split('&').forEach(item => {
            const [key, value] = item.split('=');
            if (key) params[key] = decodeURIComponent(value || '');
        });
        return params;
    }

    // Set query parameters
    setQueryParams(params) {
        const queryString = Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
        window.history.replaceState({}, '', `${window.location.pathname}?${queryString}`);
    }

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    }

    // Download file
    downloadFile(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Smooth scroll to element
    smoothScrollTo(element, duration = 500) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Get current timestamp
    getTimestamp() {
        return new Date().toISOString();
    }

    // Parse date string to readable format
    formatDate(dateString, format = 'full') {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        if (format === 'short') {
            return date.toLocaleDateString();
        } else if (format === 'time') {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        return date.toLocaleDateString('en-US', options);
    }

    // Check if device is mobile
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Check if device is touch screen
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    // Get browser info
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';
        else if (ua.includes('Opera')) browser = 'Opera';
        
        return {
            browser,
            version: ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/([0-9.]+)/)?.[2] || 'Unknown',
            os: ua.includes('Windows') ? 'Windows' : 
                ua.includes('Mac') ? 'MacOS' : 
                ua.includes('Linux') ? 'Linux' : 
                ua.includes('Android') ? 'Android' : 
                ua.includes('iOS') ? 'iOS' : 'Unknown'
        };
    }

    // Create loading spinner
    createLoadingSpinner(size = 'md') {
        const sizes = {
            sm: 'w-4 h-4',
            md: 'w-6 h-6',
            lg: 'w-8 h-8',
            xl: 'w-12 h-12'
        };
        
        const spinner = document.createElement('div');
        spinner.className = `loading-spinner ${sizes[size] || sizes.md}`;
        spinner.innerHTML = `
            <div class="spinner-border animate-spin inline-block border-2 border-current border-t-transparent rounded-full" 
                 role="status">
                <span class="sr-only">Loading...</span>
            </div>
        `;
        return spinner;
    }

    // Remove loading spinner
    removeLoadingSpinner(button) {
        const spinner = button.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    // Show loading state on button
    showButtonLoading(button) {
        const originalText = button.innerHTML;
        button.dataset.originalText = originalText;
        button.disabled = true;
        
        const spinner = this.createLoadingSpinner();
        button.innerHTML = '';
        button.appendChild(spinner);
        
        return () => {
            this.removeLoadingSpinner(button);
            button.innerHTML = originalText;
            button.disabled = false;
        };
    }
}

// Export as global utility
window.utils = new Utils();
