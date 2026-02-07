// Modal System
class ModalSystem {
    constructor(app) {
        this.app = app;
        this.modals = {};
        this.currentModal = null;
        this.initialize();
    }

    initialize() {
        this.registerModals();
        this.bindGlobalEvents();
    }

    registerModals() {
        // Register all modals on the page
        const modalElements = document.querySelectorAll('.modal');
        modalElements.forEach(modal => {
            const id = modal.id.replace('Modal', '').replace('modal', '');
            this.modals[id] = {
                element: modal,
                isOpen: false,
                data: {}
            };
        });
    }

    bindGlobalEvents() {
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close(this.currentModal);
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.currentModal && e.target.classList.contains('modal')) {
                this.close(this.currentModal);
            }
        });
    }

    open(modalName, data = {}) {
        const modal = this.modals[modalName];
        if (!modal) return;

        // Close current modal if open
        if (this.currentModal) {
            this.close(this.currentModal);
        }

        // Store modal data
        modal.data = data;
        modal.isOpen = true;
        this.currentModal = modalName;

        // Show modal
        modal.element.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Run modal-specific open logic
        this.onModalOpen(modalName, data);

        // Dispatch event
        this.dispatchEvent('modal:open', { modal: modalName, data });
    }

    close(modalName) {
        const modal = this.modals[modalName];
        if (!modal || !modal.isOpen) return;

        // Run modal-specific close logic
        this.onModalClose(modalName);

        // Hide modal
        modal.element.style.display = 'none';
        modal.isOpen = false;
        
        if (this.currentModal === modalName) {
            this.currentModal = null;
        }

        // Restore scroll
        if (!Object.values(this.modals).some(m => m.isOpen)) {
            document.body.style.overflow = 'auto';
        }

        // Dispatch event
        this.dispatchEvent('modal:close', { modal: modalName });
    }

    closeAll() {
        Object.keys(this.modals).forEach(modalName => {
            this.close(modalName);
        });
    }

    onModalOpen(modalName, data) {
        switch (modalName) {
            case 'createPost':
                this.setupCreatePostModal(data);
                break;
            case 'friendRequests':
                this.setupFriendRequestsModal(data);
                break;
            case 'tagFriends':
                this.setupTagFriendsModal(data);
                break;
            case 'createEvent':
                this.setupCreateEventModal(data);
                break;
            case 'imageViewer':
                this.setupImageViewerModal(data);
                break;
        }
    }

    onModalClose(modalName) {
        switch (modalName) {
            case 'createPost':
                this.cleanupCreatePostModal();
                break;
            case 'tagFriends':
                this.cleanupTagFriendsModal();
                break;
        }
    }

    // Create Post Modal
    setupCreatePostModal(data) {
        const modal = this.modals.createPost.element;
        
        // Set initial values
        const postText = modal.querySelector('#modalPostText');
        const privacySelect = modal.querySelector('#postPrivacy');
        
        if (data.text) postText.value = data.text;
        if (data.privacy) privacySelect.value = data.privacy;

        // Focus textarea
        setTimeout(() => postText.focus(), 100);

        // Setup image upload
        const imageUpload = modal.querySelector('#imageUpload');
        const preview = modal.querySelector('#postPreview');
        const removeBtn = modal.querySelector('#removeImageBtn');

        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = modal.querySelector('#postImagePreview');
                    img.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });

        removeBtn.addEventListener('click', () => {
            modal.querySelector('#postImagePreview').src = '';
            preview.style.display = 'none';
            imageUpload.value = '';
        });

        // Setup publish button
        const publishBtn = modal.querySelector('#publishPostBtn');
        publishBtn.addEventListener('click', () => {
            this.app.posts.createPostFromModal();
        });

        // Setup tag friends
        const tagBtn = modal.querySelector('#tagFriendsModalBtn');
        tagBtn.addEventListener('click', () => {
            this.open('tagFriends');
        });
    }

    cleanupCreatePostModal() {
        const modal = this.modals.createPost.element;
        modal.querySelector('#modalPostText').value = '';
        modal.querySelector('#postImagePreview').src = '';
        modal.querySelector('#postPreview').style.display = 'none';
        modal.querySelector('#imageUpload').value = '';
    }

    // Friend Requests Modal
    setupFriendRequestsModal(data) {
        const modal = this.modals.friendRequests.element;
        const container = modal.querySelector('#allFriendRequests');
        
        // Load and display friend requests
        this.app.friends.loadAllFriendRequests().then(requests => {
            if (requests.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-user-check"></i>
                        <h4>No pending requests</h4>
                        <p>All friend requests have been handled</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = '';
            requests.forEach(request => {
                const requestEl = this.createFriendRequestElement(request);
                container.appendChild(requestEl);
            });
        });
    }

    createFriendRequestElement(request) {
        const div = document.createElement('div');
        div.className = 'friend-request expanded';
        div.innerHTML = `
            <div class="user-avatar">${request.avatar}</div>
            <div class="friend-info">
                <h4>${request.name}</h4>
                <p class="friend-mutual">
                    <i class="fas fa-user-friends"></i> ${request.mutual} mutual friends
                </p>
                <div class="friend-actions">
                    <button class="btn btn-success accept-btn">
                        <i class="fas fa-check"></i> Accept
                    </button>
                    <button class="btn btn-secondary decline-btn">
                        <i class="fas fa-times"></i> Delete
                    </button>
                </div>
            </div>
        `;

        // Add event listeners
        div.querySelector('.accept-btn').addEventListener('click', () => {
            this.app.friends.acceptFriendRequest(request.id);
            div.remove();
        });

        div.querySelector('.decline-btn').addEventListener('click', () => {
            this.app.friends.declineFriendRequest(request.id);
            div.remove();
        });

        return div;
    }

    // Tag Friends Modal
    setupTagFriendsModal(data) {
        const modal = this.modals.tagFriends.element;
        const container = modal.querySelector('#friendsToTag');
        const searchInput = modal.querySelector('#friendSearchInput');
        
        // Load friends
        this.app.friends.loadFriendsForTagging().then(friends => {
            this.renderFriendsForTagging(friends, container);
        });

        // Setup search
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const friendItems = container.querySelectorAll('.friend-tag-item');
            
            friendItems.forEach(item => {
                const name = item.querySelector('.friend-name').textContent.toLowerCase();
                if (name.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });

        // Setup done button
        const doneBtn = modal.querySelector('#doneTagBtn');
        doneBtn.addEventListener('click', () => {
            const selectedFriends = this.getSelectedFriends();
            this.app.posts.setTaggedFriends(selectedFriends);
            this.close('tagFriends');
        });
    }

    renderFriendsForTagging(friends, container) {
        container.innerHTML = '';
        
        friends.forEach(friend => {
            const isSelected = this.app.posts.taggedFriends.includes(friend.id);
            
            const div = document.createElement('div');
            div.className = 'friend-tag-item';
            div.innerHTML = `
                <div class="user-avatar" style="position: relative;">
                    ${friend.avatar}
                    ${friend.online ? '<div class="online-status"></div>' : ''}
                </div>
                <span class="friend-name">${friend.name}</span>
                <input type="checkbox" class="friend-checkbox" 
                       data-friend-id="${friend.id}"
                       ${isSelected ? 'checked' : ''}>
            `;
            
            container.appendChild(div);
        });
    }

    getSelectedFriends() {
        const modal = this.modals.tagFriends.element;
        const checkboxes = modal.querySelectorAll('.friend-checkbox:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.dataset.friendId));
    }

    cleanupTagFriendsModal() {
        const modal = this.modals.tagFriends.element;
        modal.querySelector('#friendSearchInput').value = '';
    }

    // Create Event Modal
    setupCreateEventModal(data) {
        const modal = this.modals.createEvent.element;
        
        // Set default values
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        modal.querySelector('#eventDate').value = tomorrow.toISOString().split('T')[0];
        modal.querySelector('#eventTime').value = '19:00';
        
        // Setup save button
        const saveBtn = modal.querySelector('#saveEventBtn');
        saveBtn.addEventListener('click', () => {
            this.app.events.createEventFromModal();
        });
    }

    // Image Viewer Modal
    setupImageViewerModal(data) {
        const modal = this.modals.imageViewer.element;
        const img = modal.querySelector('#fullSizeImage');
        const author = modal.querySelector('#imageAuthor');
        
        if (data.imageUrl) {
            img.src = data.imageUrl;
        }
        if (data.author) {
            author.textContent = `Photo by ${data.author}`;
        }
    }

    // Utility Methods
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    // Public API
    getModal(modalName) {
        return this.modals[modalName];
    }

    isOpen(modalName) {
        const modal = this.modals[modalName];
        return modal ? modal.isOpen : false;
    }

    updateModalData(modalName, data) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.data = { ...modal.data, ...data };
        }
    }
}

// Export
window.modalSystem = new ModalSystem(window.app);
