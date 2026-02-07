// Posts System
class Posts {
    constructor(app) {
        this.app = app;
        this.utils = window.utils;
        this.posts = [];
        this.currentPage = 1;
        this.hasMorePosts = true;
        this.isLoading = false;
        this.taggedFriends = [];
        
        this.initialize();
    }

    initialize() {
        this.loadPosts();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Post creation
        const createPostBtn = document.getElementById('createPostBtn');
        const publishPostBtn = document.getElementById('publishPostBtn');
        
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => this.showCreatePostModal());
        }
        
        if (publishPostBtn) {
            publishPostBtn.addEventListener('click', () => this.createPostFromModal());
        }

        // Image upload
        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Tag friends
        const tagBtn = document.getElementById('tagFriendsBtn');
        if (tagBtn) {
            tagBtn.addEventListener('click', () => this.showTagFriendsModal());
        }

        // Infinite scroll
        window.addEventListener('scroll', () => this.handleScroll());

        // Search posts
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }
    }

    loadPosts() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoadingState();

        // Simulate API call
        setTimeout(() => {
            // Demo posts data
            const newPosts = this.generateDemoPosts();
            this.posts = [...this.posts, ...newPosts];
            
            this.renderPosts();
            this.currentPage++;
            this.hasMorePosts = this.currentPage < 5; // Show 5 pages max for demo
            this.isLoading = false;
            this.hideLoadingState();
        }, 800);
    }

    generateDemoPosts() {
        const users = [
            { id: 2, name: "Sarah Johnson", avatar: "SJ", online: true },
            { id: 3, name: "Mike Chen", avatar: "MC", online: true },
            { id: 4, name: "Emma Davis", avatar: "ED", online: false },
            { id: 5, name: "Alex Taylor", avatar: "AT", online: true },
            { id: 6, name: "Lisa Wong", avatar: "LW", online: false }
        ];

        const postTypes = ['text', 'image', 'video', 'poll'];
        const hashtags = ['tech', 'travel', 'food', 'photography', 'fitness', 'art'];
        
        return Array.from({ length: 5 }, (_, i) => {
            const user = users[Math.floor(Math.random() * users.length)];
            const postType = postTypes[Math.floor(Math.random() * postTypes.length)];
            const hasImage = Math.random() > 0.5;
            const taggedCount = Math.floor(Math.random() * 3);
            
            return {
                id: Date.now() + i,
                userId: user.id,
                author: user.name,
                avatar: user.avatar,
                time: this.utils.formatRelativeTime(Date.now() - Math.random() * 86400000 * 7), // Within last week
                text: this.generatePostText(),
                image: hasImage && postType === 'image' ? this.getRandomImage() : null,
                type: postType,
                likes: Math.floor(Math.random() * 500),
                comments: Math.floor(Math.random() * 50),
                shares: Math.floor(Math.random() * 20),
                userLiked: Math.random() > 0.5,
                privacy: ['public', 'friends', 'only_me'][Math.floor(Math.random() * 3)],
                tagged: Array.from({ length: taggedCount }, () => 
                    Math.floor(Math.random() * 5) + 2 // Random friend IDs
                ),
                hashtags: Array.from({ length: 2 }, () => 
                    hashtags[Math.floor(Math.random() * hashtags.length)]
                ),
                commentsList: this.generateComments()
            };
        });
    }

    generatePostText() {
        const texts = [
            "Just had the most amazing experience today! Can't wait to share more details soon. 🎉",
            "Working on something exciting! Stay tuned for updates. 💻✨",
            "Life is about creating moments that take your breath away. This one definitely did! 🌟",
            "Just finished reading an incredible book. Highly recommend it to everyone! 📚",
            "The weather is perfect today for some outdoor activities! Who's joining me? ☀️",
            "Reflecting on how far we've come and excited for what's ahead! 🚀",
            "Sharing some thoughts that have been on my mind lately. What do you think? 💭",
            "Grateful for all the amazing people in my life! 🙏❤️"
        ];
        return texts[Math.floor(Math.random() * texts.length)];
    }

    getRandomImage() {
        const images = [
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop",
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=800&fit=crop"
        ];
        return images[Math.floor(Math.random() * images.length)];
    }

    generateComments() {
        const users = [
            { id: 2, name: "Sarah Johnson", avatar: "SJ" },
            { id: 3, name: "Mike Chen", avatar: "MC" },
            { id: 4, name: "Emma Davis", avatar: "ED" },
            { id: 5, name: "Alex Taylor", avatar: "AT" }
        ];

        const comments = [
            "This is amazing! Thanks for sharing! 🙌",
            "Great content as always! Looking forward to more. 👏",
            "I completely agree with your points! Well said. 💯",
            "This made my day! Thank you! 😊",
            "Interesting perspective! Never thought about it that way. 🤔",
            "Couldn't have said it better myself! 🎯",
            "This is so inspiring! Keep up the great work. 💪",
            "Thanks for the valuable insights! Much appreciated. 🙏"
        ];

        return Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => {
            const user = users[Math.floor(Math.random() * users.length)];
            return {
                id: Date.now() + i,
                userId: user.id,
                author: user.name,
                text: comments[Math.floor(Math.random() * comments.length)],
                time: this.utils.formatRelativeTime(Date.now() - Math.random() * 3600000), // Within last hour
                likes: Math.floor(Math.random() * 10)
            };
        });
    }

    renderPosts() {
        const postsFeed = document.getElementById('postsFeed');
        if (!postsFeed) return;

        // Clear loading state if first load
        if (this.currentPage === 1) {
            postsFeed.innerHTML = '';
        }

        // Get new posts
        const newPosts = this.posts.slice((this.currentPage - 1) * 5);
        
        newPosts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsFeed.appendChild(postElement);
        });

        // Add loading indicator if more posts
        if (this.hasMorePosts && this.currentPage === 1) {
            const loader = this.createLoader();
            postsFeed.appendChild(loader);
        }
    }

    createPostElement(post) {
        const div = document.createElement('div');
        div.className = 'post';
        div.id = `post-${post.id}`;
        div.dataset.postId = post.id;
        
        // Privacy icon
        const privacyIcon = {
            'public': '🌐',
            'friends': '👥',
            'only_me': '🔒'
        }[post.privacy] || '🌐';

        // Tagged friends info
        let taggedInfo = '';
        if (post.tagged && post.tagged.length > 0) {
            const friendNames = post.tagged.map(id => 
                this.app.friends.getFriendName(id) || 'Friend'
            ).join(', ');
            taggedInfo = `<div class="tagged-friends"><i class="fas fa-user-tag"></i> ${friendNames}</div>`;
        }

        // Hashtags
        let hashtagInfo = '';
        if (post.hashtags && post.hashtags.length > 0) {
            const hashtags = post.hashtags.map(tag => `#${tag}`).join(' ');
            hashtagInfo = `<div class="post-hashtags">${hashtags}</div>`;
        }

        // Image or content
        let mediaContent = '';
        if (post.image && post.type === 'image') {
            mediaContent = `
                <div class="post-image">
                    <img src="${post.image}" alt="Post image" 
                         onclick="app.posts.viewImage('${post.image}', '${post.author}')"
                         data-tooltip="Click to view full size">
                </div>
            `;
        } else if (post.type === 'video') {
            mediaContent = `
                <div class="post-video">
                    <div class="video-placeholder">
                        <i class="fas fa-play-circle"></i>
                        <p>Video content</p>
                    </div>
                </div>
            `;
        } else if (post.type === 'poll') {
            mediaContent = `
                <div class="post-poll">
                    <div class="poll-question">What's your favorite season?</div>
                    <div class="poll-options">
                        <div class="poll-option">
                            <div class="poll-bar" style="width: 40%"></div>
                            <span>Spring (40%)</span>
                        </div>
                        <div class="poll-option">
                            <div class="poll-bar" style="width: 30%"></div>
                            <span>Summer (30%)</span>
                        </div>
                        <div class="poll-option">
                            <div class="poll-bar" style="width: 20%"></div>
                            <span>Fall (20%)</span>
                        </div>
                        <div class="poll-option">
                            <div class="poll-bar" style="width: 10%"></div>
                            <span>Winter (10%)</span>
                        </div>
                    </div>
                </div>
            `;
        }

        div.innerHTML = `
            <div class="post-header">
                <div class="user-avatar" style="position: relative;">
                    ${post.avatar}
                    <div class="online-status ${this.app.friends.isFriendOnline(post.userId) ? '' : 'offline'}"></div>
                </div>
                <div class="post-author">
                    <h4>${post.author}</h4>
                    <div class="post-time">
                        ${post.time} • ${privacyIcon}
                    </div>
                </div>
                <button class="post-options" onclick="app.posts.showPostOptions(${post.id})">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
            <div class="post-content">
                <p class="post-text">${post.text}</p>
                ${taggedInfo}
                ${hashtagInfo}
                ${mediaContent}
            </div>
            <div class="post-stats">
                <span class="stat-item" onclick="app.posts.showLikes(${post.id})">
                    <i class="fas fa-thumbs-up"></i> ${this.utils.formatNumber(post.likes)}
                </span>
                <span class="stat-item" onclick="app.posts.focusComment(${post.id})">
                    <i class="fas fa-comment"></i> ${this.utils.formatNumber(post.comments)}
                </span>
                <span class="stat-item" onclick="app.posts.showShares(${post.id})">
                    <i class="fas fa-share"></i> ${this.utils.formatNumber(post.shares)}
                </span>
            </div>
            <div class="post-actions-bar">
                <button class="post-action-btn ${post.userLiked ? 'active' : ''}" 
                        onclick="app.posts.likePost(${post.id})">
                    <i class="fas fa-thumbs-up"></i> ${post.userLiked ? 'Liked' : 'Like'}
                </button>
                <button class="post-action-btn" onclick="app.posts.focusComment(${post.id})">
                    <i class="fas fa-comment"></i> Comment
                </button>
                <button class="post-action-btn" onclick="app.posts.sharePost(${post.id})">
                    <i class="fas fa-share"></i> Share
                </button>
            </div>
            <div class="comments-section">
                <div id="comments-${post.id}">
                    ${post.commentsList.map(comment => `
                        <div class="comment" id="comment-${post.id}-${comment.id}">
                            <div class="user-avatar" style="width: 36px; height: 36px; font-size: 14px;">
                                ${comment.avatar || 'U'}
                            </div>
                            <div class="comment-content">
                                <div class="comment-author">${comment.author}</div>
                                <p class="comment-text">${comment.text}</p>
                                <div class="comment-actions">
                                    <span class="comment-time">${comment.time}</span>
                                    <span class="comment-action" onclick="app.posts.likeComment(${post.id}, ${comment.id})">
                                        <i class="fas fa-thumbs-up"></i> Like ${comment.likes > 0 ? `(${comment.likes})` : ''}
                                    </span>
                                    <span class="comment-action" onclick="app.posts.replyToComment(${post.id}, ${comment.id})">
                                        <i class="fas fa-reply"></i> Reply
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="comment-input">
                    <div class="user-avatar" style="width: 36px; height: 36px; font-size: 14px;">
                        ${this.app.auth.getUser()?.avatar || 'U'}
                    </div>
                    <input type="text" id="comment-input-${post.id}" 
                           placeholder="Write a comment..."
                           onkeypress="if(event.key === 'Enter') app.posts.addComment(${post.id})">
                    <button class="btn btn-primary btn-sm" onclick="app.posts.addComment(${post.id})">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        return div;
    }

    createLoader() {
        const loader = document.createElement('div');
        loader.className = 'posts-loader';
        loader.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading more posts...</p>
        `;
        return loader;
    }

    showLoadingState() {
        const postsFeed = document.getElementById('postsFeed');
        if (postsFeed && this.currentPage === 1) {
            postsFeed.innerHTML = `
                <div class="loading-posts">
                    <div class="loading-spinner large"></div>
                    <p>Loading posts...</p>
                </div>
            `;
        }
    }

    hideLoadingState() {
        const loader = document.querySelector('.posts-loader, .loading-posts');
        if (loader) {
            loader.remove();
        }
    }

    // Post Interactions
    likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        post.userLiked = !post.userLiked;
        post.likes += post.userLiked ? 1 : -1;

        // Update UI
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
            const likeBtn = postElement.querySelector('.post-action-btn');
            const likeCount = postElement.querySelector('.stat-item:first-child');
            
            if (likeBtn) {
                likeBtn.classList.toggle('active', post.userLiked);
                likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> ${post.userLiked ? 'Liked' : 'Like'}`;
            }
            
            if (likeCount) {
                likeCount.innerHTML = `<i class="fas fa-thumbs-up"></i> ${this.utils.formatNumber(post.likes)}`;
            }

            // Add animation
            postElement.style.transform = 'translateY(-4px)';
            setTimeout(() => {
                postElement.style.transform = '';
            }, 300);
        }

        // Show notification
        this.app.notifications.success(
            post.userLiked ? 'Liked!' : 'Unliked',
            post.userLiked ? `You liked ${post.author}'s post` : `You unliked ${post.author}'s post`
        );
    }

    addComment(postId) {
        const input = document.getElementById(`comment-input-${postId}`);
        const text = input?.value.trim();
        
        if (!text || !this.app.auth.isAuthenticated()) return;

        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const user = this.app.auth.getUser();
        const newComment = {
            id: Date.now(),
            userId: user.id,
            author: user.name,
            avatar: user.avatar,
            text: text,
            time: 'Just now',
            likes: 0
        };

        post.commentsList.push(newComment);
        post.comments++;

        // Update UI
        const commentsContainer = document.getElementById(`comments-${postId}`);
        if (commentsContainer) {
            const commentElement = this.createCommentElement(newComment, postId);
            commentsContainer.appendChild(commentElement);
            
            // Update comment count
            const commentCount = document.querySelector(`#post-${postId} .stat-item:nth-child(2)`);
            if (commentCount) {
                commentCount.innerHTML = `<i class="fas fa-comment"></i> ${this.utils.formatNumber(post.comments)}`;
            }
        }

        // Clear input
        if (input) {
            input.value = '';
        }

        // Show notification
        this.app.notifications.success('Comment added', 'Your comment has been posted');
        
        // Scroll to new comment
        setTimeout(() => {
            const newCommentElement = document.getElementById(`comment-${postId}-${newComment.id}`);
            if (newCommentElement) {
                newCommentElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    }

    createCommentElement(comment, postId) {
        const div = document.createElement('div');
        div.className = 'comment';
        div.id = `comment-${postId}-${comment.id}`;
        
        div.innerHTML = `
            <div class="user-avatar" style="width: 36px; height: 36px; font-size: 14px;">
                ${comment.avatar || 'U'}
            </div>
            <div class="comment-content">
                <div class="comment-author">${comment.author}</div>
                <p class="comment-text">${comment.text}</p>
                <div class="comment-actions">
                    <span class="comment-time">${comment.time}</span>
                    <span class="comment-action" onclick="app.posts.likeComment(${postId}, ${comment.id})">
                        <i class="fas fa-thumbs-up"></i> Like
                    </span>
                    <span class="comment-action" onclick="app.posts.replyToComment(${postId}, ${comment.id})">
                        <i class="fas fa-reply"></i> Reply
                    </span>
                </div>
            </div>
        `;

        return div;
    }

    likeComment(postId, commentId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const comment = post.commentsList.find(c => c.id === commentId);
        if (!comment) return;

        comment.likes++;

        // Update UI
        const commentElement = document.getElementById(`comment-${postId}-${commentId}`);
        if (commentElement) {
            const likeBtn = commentElement.querySelector('.comment-action:first-child');
            if (likeBtn) {
                likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i> Like (${comment.likes})`;
            }
        }

        this.app.notifications.info('Liked', 'You liked the comment');
    }

    sharePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        post.shares++;

        // Update UI
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
            const shareCount = postElement.querySelector('.stat-item:last-child');
            if (shareCount) {
                shareCount.innerHTML = `<i class="fas fa-share"></i> ${this.utils.formatNumber(post.shares)}`;
            }
        }

        this.app.notifications.success('Shared', `You shared ${post.author}'s post`);
    }

    // Modal Functions
    showCreatePostModal() {
        this.app.modals.open('createPost');
    }

    createPostFromModal() {
        const modal = document.getElementById('createPostModal');
        const text = modal.querySelector('#modalPostText').value.trim();
        const privacy = modal.querySelector('#postPrivacy').value;
        const imagePreview = modal.querySelector('#postImagePreview').src;

        if (!text && !imagePreview) {
            this.app.notifications.error('Error', 'Please write something or add an image');
            return;
        }

        const user = this.app.auth.getUser();
        if (!user) {
            this.app.notifications.error('Error', 'Please login to create posts');
            return;
        }

        const newPost = {
            id: Date.now(),
            userId: user.id,
            author: user.name,
            avatar: user.avatar,
            time: 'Just now',
            text: text,
            image: imagePreview || null,
            type: imagePreview ? 'image' : 'text',
            likes: 0,
            comments: 0,
            shares: 0,
            userLiked: false,
            privacy: privacy,
            tagged: this.taggedFriends,
            hashtags: this.extractHashtags(text),
            commentsList: []
        };

        // Add to beginning of posts array
        this.posts.unshift(newPost);

        // Clear modal
        modal.querySelector('#modalPostText').value = '';
        modal.querySelector('#postImagePreview').src = '';
        modal.querySelector('#postPreview').style.display = 'none';
        modal.querySelector('#imageUpload').value = '';
        this.taggedFriends = [];

        // Close modal
        this.app.modals.close('createPost');

        // Render new post
        const postsFeed = document.getElementById('postsFeed');
        if (postsFeed) {
            const postElement = this.createPostElement(newPost);
            postsFeed.prepend(postElement);
            
            // Add animation
            postElement.style.animation = 'fadeIn 0.5s ease-out';
        }

        this.app.notifications.success('Posted!', 'Your post has been published');
    }

    extractHashtags(text) {
        const hashtags = text.match(/#(\w+)/g);
        return hashtags ? hashtags.map(tag => tag.substring(1).toLowerCase()) : [];
    }

    showTagFriendsModal() {
        this.app.modals.open('tagFriends');
    }

    setTaggedFriends(friendIds) {
        this.taggedFriends = friendIds;
        if (friendIds.length > 0) {
            this.app.notifications.info('Tagged', `Tagged ${friendIds.length} friend(s)`);
        }
    }

    // Image handling
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.app.notifications.error('Error', 'Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.app.notifications.error('Error', 'Image size should be less than 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('postImagePreview');
            const previewContainer = document.getElementById('postPreview');
            
            if (preview) {
                preview.src = e.target.result;
                previewContainer.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    viewImage(imageUrl, author) {
        this.app.modals.open('imageViewer', { imageUrl, author });
    }

    // Search
    handleSearch(event) {
        const query = event.target.value.toLowerCase().trim();
        if (!query) {
            this.renderPosts();
            return;
        }

        // Filter posts by search query
        const filteredPosts = this.posts.filter(post => 
            post.text.toLowerCase().includes(query) ||
            post.author.toLowerCase().includes(query) ||
            (post.hashtags && post.hashtags.some(tag => tag.includes(query)))
        );

        this.renderSearchResults(filteredPosts);
    }

    renderSearchResults(posts) {
        const postsFeed = document.getElementById('postsFeed');
        if (!postsFeed) return;

        postsFeed.innerHTML = '';

        if (posts.length === 0) {
            postsFeed.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h4>No posts found</h4>
                    <p>Try different keywords or check back later</p>
                </div>
            `;
            return;
        }

        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsFeed.appendChild(postElement);
        });
    }

    // Load more on scroll
    handleScroll() {
        if (this.isLoading || !this.hasMorePosts) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

        if (scrollPercentage > 80) {
            this.loadPosts();
        }
    }

    // Utility methods
    showPostOptions(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const user = this.app.auth.getUser();
        const isOwnPost = post.userId === user?.id;

        const options = isOwnPost 
            ? ['Edit Post', 'Delete Post', 'Share', 'Save', 'Turn Off Notifications']
            : ['Save Post', 'Hide Post', 'Report Post', 'Unfollow', 'Turn Off Notifications'];

        this.showOptionsMenu(options, postId);
    }

    showOptionsMenu(options, postId) {
        // Create options menu
        const menu = document.createElement('div');
        menu.className = 'post-options-menu';
        menu.innerHTML = options.map(option => 
            `<div class="option-item">${option}</div>`
        ).join('');

        // Position menu
        const postElement = document.getElementById(`post-${postId}`);
        if (postElement) {
            const rect = postElement.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = `${rect.top + 40}px`;
            menu.style.right = `${window.innerWidth - rect.right + 20}px`;
            
            document.body.appendChild(menu);

            // Add click handlers
            menu.querySelectorAll('.option-item').forEach((item, index) => {
                item.addEventListener('click', () => {
                    this.handleOptionSelect(options[index], postId);
                    menu.remove();
                });
            });

            // Close on outside click
            const closeMenu = (e) => {
                if (!menu.contains(e.target) && !postElement.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            
            setTimeout(() => document.addEventListener('click', closeMenu));
        }
    }

    handleOptionSelect(option, postId) {
        switch (option) {
            case 'Edit Post':
                this.editPost(postId);
                break;
            case 'Delete Post':
                this.deletePost(postId);
                break;
            case 'Save Post':
                this.savePost(postId);
                break;
            case 'Report Post':
                this.reportPost(postId);
                break;
            default:
                this.app.notifications.info('Option', `${option} clicked`);
        }
    }

    editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            this.app.modals.open('createPost', {
                text: post.text,
                privacy: post.privacy
            });
        }
    }

    deletePost(postId) {
        if (confirm('Are you sure you want to delete this post?')) {
            this.posts = this.posts.filter(p => p.id !== postId);
            const postElement = document.getElementById(`post-${postId}`);
            if (postElement) {
                postElement.remove();
            }
            this.app.notifications.success('Deleted', 'Post has been deleted');
        }
    }

    savePost(postId) {
        this.app.notifications.success('Saved', 'Post has been saved to your collection');
    }

    reportPost(postId) {
        this.app.notifications.info('Report', 'Post has been reported for review');
    }

    focusComment(postId) {
        const input = document.getElementById(`comment-input-${postId}`);
        if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    replyToComment(postId, commentId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const comment = post.commentsList.find(c => c.id === commentId);
        if (!comment) return;

        const input = document.getElementById(`comment-input-${postId}`);
        if (input) {
            input.value = `@${comment.author} `;
            input.focus();
        }
    }

    showLikes(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            this.app.notifications.info('Likes', `${post.likes} people liked this post`);
        }
    }

    showShares(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            this.app.notifications.info('Shares', `${post.shares} people shared this post`);
        }
    }

    // Load more posts
    loadMorePosts() {
        if (this.hasMorePosts && !this.isLoading) {
            this.loadPosts();
        }
    }

    // Get post by ID
    getPost(postId) {
        return this.posts.find(p => p.id === postId);
    }

    // Get user's posts
    getUserPosts(userId) {
        return this.posts.filter(p => p.userId === userId);
    }
}

// Export
window.posts = new Posts(window.app);
