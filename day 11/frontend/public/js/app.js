const app = {
    init: () => {
        // Initialize all modules
        chat.init(); // Initialize chat module elements and listeners
        swipe.init(); // Initialize swipe module elements

        app.setupEventListeners();
        app.renderContent();
        window.addEventListener('hashchange', app.renderContent);
    },

    setupEventListeners: () => {
        // Navigation Buttons
        document.getElementById('nav-login-btn').addEventListener('click', () => window.location.hash = '#login');
        document.getElementById('nav-register-btn').addEventListener('click', () => window.location.hash = '#register');
        document.getElementById('nav-dashboard-btn').addEventListener('click', () => window.location.hash = '#dashboard');
        document.getElementById('nav-profile-btn').addEventListener('click', () => window.location.hash = '#profile');
        document.getElementById('nav-matches-btn').addEventListener('click', () => window.location.hash = '#matches');
        document.getElementById('nav-logout-btn').addEventListener('click', auth.logout);

        // Forms
        document.getElementById('login-form').addEventListener('submit', app.handleLogin);
        document.getElementById('register-form').addEventListener('submit', app.handleRegister);
        document.getElementById('profile-form').addEventListener('submit', profile.updateProfile);

        // Navigation links within auth forms
        document.getElementById('show-register').addEventListener('click', (e) => { e.preventDefault(); window.location.hash = '#register'; });
        document.getElementById('show-login').addEventListener('click', (e) => { e.preventDefault(); window.location.hash = '#login'; });

        // Swipe buttons
        document.getElementById('like-btn').addEventListener('click', () => swipe.handleSwipe('like'));
        document.getElementById('dislike-btn').addEventListener('click', () => swipe.handleSwipe('dislike'));

        // Profile Picture Upload (uncomment if using multer on backend)
        // const profilePictureUpload = document.getElementById('profile-picture-upload');
        // document.getElementById('upload-picture-btn').addEventListener('click', () => profilePictureUpload.click());
        // profilePictureUpload.addEventListener('change', (event) => {
        //     if (event.target.files.length > 0) {
        //         profile.uploadProfilePicture(event.target.files[0]);
        //     }
        // });
    },

    renderContent: async () => {
        const path = window.location.hash.substring(1) || (auth.isAuthenticated() ? 'dashboard' : 'login');
        app.hideAllSections();
        app.updateNavigationVisibility();

        if (auth.isAuthenticated()) {
            const currentUser = await auth.getMe();
            if (!currentUser) { // If getMe fails, token is likely invalid
                auth.logout();
                return;
            }

            switch (path) {
                case 'dashboard':
                    app.showSection('dashboard-section');
                    await swipe.loadPotentialMatches();
                    break;
                case 'profile':
                    app.showSection('profile-section');
                    await profile.loadProfile();
                    break;
                case 'matches':
                    app.showSection('matches-section');
                    await app.loadMatches();
                    break;
                case 'chat':
                    // Chat section needs a partner ID, handled by `loadMatches`
                    break;
                default:
                    app.showSection('dashboard-section');
                    await swipe.loadPotentialMatches();
                    break;
            }
        } else {
            // Not authenticated, show login or register
            if (path === 'register') {
                app.showSection('register-section');
            } else {
                app.showSection('login-section');
            }
        }
    },

    hideAllSections: () => {
        document.querySelectorAll('main section').forEach(section => {
            section.classList.add('hidden');
        });
    },

    showSection: (sectionId) => {
        document.getElementById(sectionId).classList.remove('hidden');
    },

    updateNavigationVisibility: () => {
        const isAuthenticated = auth.isAuthenticated();
        document.getElementById('nav-login-btn').classList.toggle('hidden', isAuthenticated);
        document.getElementById('nav-register-btn').classList.toggle('hidden', isAuthenticated);
        document.getElementById('nav-dashboard-btn').classList.toggle('hidden', !isAuthenticated);
        document.getElementById('nav-profile-btn').classList.toggle('hidden', !isAuthenticated);
        document.getElementById('nav-matches-btn').classList.toggle('hidden', !isAuthenticated);
        document.getElementById('nav-logout-btn').classList.toggle('hidden', !isAuthenticated);
    },

    handleLogin: async (event) => {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const user = await auth.login(email, password);
        if (user) {
            window.location.hash = '#dashboard';
            window.location.reload(); // Simple reload to re-render content
        }
    },

    handleRegister: async (event) => {
        event.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const gender = document.getElementById('register-gender').value;
        const interested_in = document.getElementById('register-interested-in').value;
        const dob = document.getElementById('register-dob').value;
        const location = document.getElementById('register-location').value;

        const user = await auth.register(username, email, password, gender, interested_in, dob, location);
        if (user) {
            alert('Registration successful! You are now logged in.');
            window.location.hash = '#dashboard';
            window.location.reload(); // Simple reload to re-render content
        }
    },

    loadMatches: async () => {
        const matchesListContainer = document.getElementById('matches-list');
        matchesListContainer.innerHTML = ''; // Clear previous matches
        document.getElementById('no-matches-found').classList.add('hidden');

        try {
            const matches = await api.request('/matches');
            if (matches.length === 0) {
                document.getElementById('no-matches-found').classList.remove('hidden');
            } else {
                matches.forEach(match => {
                    const matchCard = document.createElement('div');
                    matchCard.classList.add('card', 'p-4', 'flex', 'items-center', 'space-x-4');
                    matchCard.innerHTML = `
                        <img src="${match.profile_picture_url || 'https://via.placeholder.com/100'}" alt="${match.username}" class="w-16 h-16 rounded-full object-cover">
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">${match.username}</h3>
                            <p class="text-sm text-gray-600">Matched on ${new Date(match.matched_at).toLocaleDateString()}</p>
                            <button class="btn-primary text-sm mt-2 chat-btn" data-user-id="${match.matched_user_id}" data-username="${match.username}">Chat</button>
                        </div>
                    `;
                    matchesListContainer.appendChild(matchCard);
                });

                // Add event listeners to chat buttons
                matchesListContainer.querySelectorAll('.chat-btn').forEach(button => {
                    button.addEventListener('click', (event) => {
                        const userId = event.target.dataset.userId;
                        const username = event.target.dataset.username;
                        app.showSection('chat-section');
                        chat.loadMessages(userId, username);
                    });
                });
            }
        } catch (error) {
            console.error('Failed to load matches:', error);
            alert('Failed to load matches: ' + error.message);
        }
    }
};

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', app.init);