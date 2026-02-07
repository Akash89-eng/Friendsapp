// Events System
class Events {
    constructor(app) {
        this.app = app;
        this.utils = window.utils;
        this.events = [];
        this.userEvents = []; // Events user is attending
        this.initialize();
    }

    initialize() {
        this.loadDemoData();
        this.renderEvents();
        this.setupEventListeners();
    }

    loadDemoData() {
        // Demo events data
        this.events = [
            {
                id: 1,
                title: "Weekend BBQ Party",
                date: "Tomorrow",
                time: "3:00 PM",
                location: "Central Park",
                description: "Summer BBQ with friends! Bring your favorite dish to share.",
                creator: {
                    id: 2,
                    name: "Sarah Johnson",
                    avatar: "SJ"
                },
                attendees: [1, 2, 3, 4, 5, 7, 8], // Including current user (id: 1)
                privacy: "friends",
                category: "social",
                coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop",
                isAttending: true
            },
            {
                id: 2,
                title: "Tech Conference 2024",
                date: "June 15",
                time: "9:00 AM",
                location: "Convention Center",
                description: "Annual tech conference featuring the latest innovations in AI, blockchain, and web development.",
                creator: {
                    id: 5,
                    name: "Alex Taylor",
                    avatar: "AT"
                },
                attendees: [1, 2, 3, 7],
                privacy: "public",
                category: "tech",
                coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
                isAttending: true
            },
            {
                id: 3,
                title: "Book Club Meeting",
                date: "June 20",
                time: "7:00 PM",
                location: "City Library",
                description: "Discussion on 'The Midnight Library' by Matt Haig. Refreshments will be provided.",
                creator: {
                    id: 4,
                    name: "Emma Davis",
                    avatar: "ED"
                },
                attendees: [1, 5, 6],
                privacy: "invite",
                category: "education",
                coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=400&fit=crop",
                isAttending: false
            },
            {
                id: 4,
                title: "Yoga in the Park",
                date: "June 25",
                time: "8:00 AM",
                location: "Sunset Park",
                description: "Morning yoga session for all levels. Bring your own mat and water bottle.",
                creator: {
                    id: 3,
                    name: "Mike Chen",
                    avatar: "MC"
                },
                attendees: [2, 3, 4, 8],
                privacy: "public",
                category: "fitness",
                coverImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop",
                isAttending: false
            }
        ];

        this.updateUserEvents();
    }

    updateUserEvents() {
        this.userEvents = this.events.filter(event => event.isAttending);
    }

    setupEventListeners() {
        // Create event button
        const createEventBtn = document.getElementById('createEventBtn');
        if (createEventBtn) {
            createEventBtn.addEventListener('click', () => {
                this.showCreateEventModal();
            });
        }

        // Event RSVP buttons
        document.addEventListener('click', (e) => {
            const rsvpBtn = e.target.closest('[data-event-id]');
            if (rsvpBtn && rsvpBtn.dataset.eventId) {
                const eventId = parseInt(rsvpBtn.dataset.eventId);
                const isAttending = rsvpBtn.dataset.action === 'attend';
                this.handleRSVP(eventId, isAttending);
            }
        });

        // View all events
        const viewAllEvents = document.querySelector('[data-action="view-all-events"]');
        if (viewAllEvents) {
            viewAllEvents.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAllEvents();
            });
        }
    }

    renderEvents() {
        const container = document.getElementById('eventsList');
        if (!container) return;

        const upcomingEvents = this.events.slice(0, 3); // Show first 3 events

        container.innerHTML = '';
        upcomingEvents.forEach(event => {
            const eventElement = this.createEventElement(event);
            container.appendChild(eventElement);
        });
    }

    createEventElement(event) {
        const div = document.createElement('div');
        div.className = 'event-item';
        div.dataset.eventId = event.id;
        
        const attendeeCount = event.attendees.length;
        const isAttending = event.isAttending;
        const rsvpButton = isAttending ? 
            `<button class="btn btn-success" data-event-id="${event.id}" data-action="unattend">
                <i class="fas fa-check-circle"></i> Attending
            </button>` :
            `<button class="btn btn-primary" data-event-id="${event.id}" data-action="attend">
                <i class="fas fa-calendar-plus"></i> RSVP
            </button>`;
        
        const privacyIcon = {
            'public': '🌐',
            'friends': '👥',
            'invite': '🎫'
        }[event.privacy] || '🌐';

        div.innerHTML = `
            <div class="event-date">${event.date}</div>
            <h4>${event.title}</h4>
            <div class="event-details">
                <i class="fas fa-clock"></i>
                <span>${event.time}</span>
                <i class="fas fa-map-marker-alt"></i>
                <span>${event.location}</span>
                <i class="fas fa-users"></i>
                <span>${attendeeCount} going</span>
            </div>
            <div class="event-description">
                ${event.description}
            </div>
            <div class="event-footer">
                <span class="event-privacy">${privacyIcon} ${event.privacy}</span>
                ${rsvpButton}
            </div>
        `;

        return div;
    }

    handleRSVP(eventId, attending = true) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const currentUser = this.app.auth.getUser();
        if (!currentUser) {
            this.app.notifications.error('Error', 'Please login to RSVP to events');
            return;
        }

        const currentUserIndex = event.attendees.indexOf(currentUser.id);
        
        if (attending) {
            if (currentUserIndex === -1) {
                event.attendees.push(currentUser.id);
                event.isAttending = true;
                this.updateUserEvents();
                this.app.notifications.success('RSVP confirmed', `You are attending "${event.title}"`);
            }
        } else {
            if (currentUserIndex !== -1) {
                event.attendees.splice(currentUserIndex, 1);
                event.isAttending = false;
                this.updateUserEvents();
                this.app.notifications.info('RSVP updated', `You are no longer attending "${event.title}"`);
            }
        }

        // Update UI
        this.renderEvents();
    }

    showCreateEventModal() {
        this.app.modals.open('createEvent');
    }

    createEventFromModal() {
        const modal = document.getElementById('createEventModal');
        if (!modal) return;

        const title = document.getElementById('eventTitle').value.trim();
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const location = document.getElementById('eventLocation').value.trim();
        const description = document.getElementById('eventDescription').value.trim();
        const privacy = document.getElementById('eventPrivacy').value;

        // Validation
        if (!title || !date || !time || !location) {
            this.app.notifications.error('Error', 'Please fill all required fields');
            return;
        }

        const currentUser = this.app.auth.getUser();
        if (!currentUser) {
            this.app.notifications.error('Error', 'Please login to create events');
            return;
        }

        // Format date
        const eventDate = new Date(date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });

        // Create new event
        const newEvent = {
            id: Date.now(),
            title,
            date: formattedDate,
            time,
            location,
            description,
            privacy,
            creator: {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar
            },
            attendees: [currentUser.id],
            category: this.detectCategory(title, description),
            coverImage: this.getRandomCoverImage(),
            isAttending: true
        };

        // Add to events list
        this.events.unshift(newEvent);
        this.updateUserEvents();

        // Clear form
        modal.querySelector('#eventTitle').value = '';
        modal.querySelector('#eventDate').value = '';
        modal.querySelector('#eventTime').value = '';
        modal.querySelector('#eventLocation').value = '';
        modal.querySelector('#eventDescription').value = '';

        // Close modal
        this.app.modals.close('createEvent');

        // Update UI
        this.renderEvents();

        // Show notification
        this.app.notifications.success(
            'Event created!',
            `${title} has been scheduled for ${formattedDate}`
        );

        // Notify friends (in a real app, this would be a socket/API call)
        this.notifyFriendsAboutEvent(newEvent);
    }

    detectCategory(title, description) {
        const text = (title + ' ' + description).toLowerCase();
        
        if (text.includes('tech') || text.includes('conference') || text.includes('workshop')) {
            return 'tech';
        } else if (text.includes('yoga') || text.includes('fitness') || text.includes('workout')) {
            return 'fitness';
        } else if (text.includes('book') || text.includes('reading') || text.includes('library')) {
            return 'education';
        } else if (text.includes('party') || text.includes('bbq') || text.includes('social')) {
            return 'social';
        } else if (text.includes('music') || text.includes('concert') || text.includes('festival')) {
            return 'music';
        } else if (text.includes('art') || text.includes('exhibition') || text.includes('gallery')) {
            return 'art';
        } else if (text.includes('food') || text.includes('dinner') || text.includes('restaurant')) {
            return 'food';
        } else if (text.includes('charity') || text.includes('volunteer') || text.includes('fundraiser')) {
            return 'charity';
        }
        
        return 'general';
    }

    getRandomCoverImage() {
        const images = [
            "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1492684223066-dd23140edf6d?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1501281668745-f6f2612d4a3b?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=400&fit=crop",
            "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop"
        ];
        return images[Math.floor(Math.random() * images.length)];
    }

    notifyFriendsAboutEvent(event) {
        // In a real app, this would notify friends via socket/API
        console.log(`Notifying friends about event: ${event.title}`);
        
        // For demo, just show a notification
        setTimeout(() => {
            this.app.notifications.info(
                'Friends notified',
                `Your friends have been notified about "${event.title}"`
            );
        }, 1000);
    }

    showAllEvents() {
        // Create events overlay
        const overlay = document.createElement('div');
        overlay.className = 'events-overlay';
        
        overlay.innerHTML = `
            <div class="events-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-alt"></i> All Events</h3>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="createNewEventBtn">
                            <i class="fas fa-plus"></i> Create Event
                        </button>
                        <button class="close-modal">&times;</button>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="events-tabs">
                        <button class="tab-btn active" data-tab="upcoming">Upcoming</button>
                        <button class="tab-btn" data-tab="past">Past Events</button>
                        <button class="tab-btn" data-tab="my-events">My Events</button>
                        <button class="tab-btn" data-tab="invites">Invites</button>
                    </div>
                    <div class="events-grid" id="eventsGrid">
                        ${this.events.map(event => this.createEventCard(event)).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Add event listeners
        overlay.querySelector('.close-modal').addEventListener('click', () => {
            overlay.remove();
        });

        overlay.querySelector('#createNewEventBtn').addEventListener('click', () => {
            this.showCreateEventModal();
            overlay.remove();
        });

        overlay.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                overlay.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterEvents(e.target.dataset.tab, overlay.querySelector('#eventsGrid'));
            });
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    createEventCard(event) {
        const attendeeCount = event.attendees.length;
        const isAttending = event.isAttending;
        
        return `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-cover" style="background-image: url('${event.coverImage}')">
                    <div class="event-category">${event.category}</div>
                    <div class="event-privacy-badge">${event.privacy}</div>
                </div>
                <div class="event-content">
                    <div class="event-date">${event.date} • ${event.time}</div>
                    <h4>${event.title}</h4>
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location}
                    </p>
                    <p class="event-description">${event.description}</p>
                    <div class="event-footer">
                        <div class="event-attendees">
                            <i class="fas fa-users"></i> ${attendeeCount} attending
                        </div>
                        <button class="btn ${isAttending ? 'btn-success' : 'btn-primary'}">
                            ${isAttending ? 'Attending' : 'RSVP'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    filterEvents(filter, container) {
        let filteredEvents = this.events;
        
        switch (filter) {
            case 'past':
                filteredEvents = this.events.filter(event => 
                    new Date(event.date) < new Date()
                );
                break;
            case 'my-events':
                filteredEvents = this.userEvents;
                break;
            case 'invites':
                // For demo, show events user is not attending
                filteredEvents = this.events.filter(event => !event.isAttending);
                break;
            // 'upcoming' is default
        }

        if (filteredEvents.length === 0) {
            container.innerHTML = `
                <div class="empty-events">
                    <i class="fas fa-calendar-times"></i>
                    <h4>No events found</h4>
                    <p>Try a different filter or create a new event</p>
                </div>
            `;
        } else {
            container.innerHTML = filteredEvents.map(event => 
                this.createEventCard(event)
            ).join('');
        }
    }

    // Get event by ID
    getEvent(eventId) {
        return this.events.find(e => e.id === eventId);
    }

    // Get events user is attending
    getUserEvents() {
        return this.userEvents;
    }

    // Get upcoming events (next 7 days)
    getUpcomingEvents(days = 7) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today && eventDate <= futureDate;
        });
    }

    // Search events
    searchEvents(query) {
        const searchTerm = query.toLowerCase();
        return this.events.filter(event =>
            event.title.toLowerCase().includes(searchTerm) ||
            event.description.toLowerCase().includes(searchTerm) ||
            event.location.toLowerCase().includes(searchTerm) ||
            event.category.toLowerCase().includes(searchTerm)
        );
    }

    // Export events to calendar (ICS format)
    exportEventsToCalendar() {
        // In a real app, this would generate ICS file
        this.app.notifications.info(
            'Export',
            'Event export feature would generate ICS file'
        );
    }

    // Send event invites
    sendEventInvites(eventId, friendIds) {
        const event = this.getEvent(eventId);
        if (!event) return false;

        // In a real app, this would send invites via API
        this.app.notifications.success(
            'Invites sent',
            `Invites sent for "${event.title}"`
        );

        return true;
    }

    // Update event
    updateEvent(eventId, updates) {
        const event = this.getEvent(eventId);
        if (!event) return false;

        Object.assign(event, updates);
        this.app.notifications.success('Updated', 'Event updated successfully');
        return true;
    }

    // Delete event
    deleteEvent(eventId) {
        const eventIndex = this.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) return false;

        const event = this.events[eventIndex];
        this.events.splice(eventIndex, 1);
        this.updateUserEvents();

        this.app.notifications.info(
            'Deleted',
            `"${event.title}" has been deleted`
        );

        return true;
    }

    // Get event statistics
    getEventStats() {
        const totalEvents = this.events.length;
        const attendingEvents = this.userEvents.length;
        const publicEvents = this.events.filter(e => e.privacy === 'public').length;
        const privateEvents = this.events.filter(e => e.privacy === 'invite').length;
        
        return {
            totalEvents,
            attendingEvents,
            publicEvents,
            privateEvents,
            createdEvents: this.events.filter(e => e.creator.id === 1).length // Current user's events
        };
    }

    // Generate event suggestions based on interests
    getEventSuggestions() {
        const categories = ['tech', 'fitness', 'social', 'education', 'music', 'art', 'food', 'charity'];
        const suggestions = [];
        
        categories.forEach(category => {
            const categoryEvents = this.events.filter(e => e.category === category);
            if (categoryEvents.length > 0) {
                suggestions.push({
                    category,
                    count: categoryEvents.length,
                    sampleEvent: categoryEvents[0]
                });
            }
        });
        
        return suggestions;
    }

    // Set event reminder
    setEventReminder(eventId, minutesBefore = 30) {
        const event = this.getEvent(eventId);
        if (!event) return false;

        // In a real app, this would set browser/device notifications
        this.app.notifications.success(
            'Reminder set',
            `You'll be reminded 30 minutes before "${event.title}"`
        );

        return true;
    }
}

// Export
window.events = new Events(window.app);
