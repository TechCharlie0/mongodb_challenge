const swipe = {
    profiles: [],
    currentIndex: 0,
    swipeCardContainer: null,
    noMoreProfilesMessage: null,

    init: () => {
        swipe.swipeCardContainer = document.getElementById('swipe-card-container');
        swipe.noMoreProfilesMessage = document.getElementById('no-more-profiles');
    },

    loadPotentialMatches: async () => {
        try {
            const data = await api.request('/matches/potential');
            swipe.profiles = data;
            swipe.currentIndex = 0;
            swipe.displayCurrentProfile();
        } catch (error) {
            console.error('Failed to load potential matches:', error);
            alert('Failed to load potential matches: ' + error.message);
            swipe.showNoMoreProfiles();
        }
    },

    displayCurrentProfile: () => {
        swipe.swipeCardContainer.innerHTML = ''; // Clear previous card
        if (swipe.profiles.length === 0 || swipe.currentIndex >= swipe.profiles.length) {
            swipe.showNoMoreProfiles();
            return;
        }

        swipe.noMoreProfilesMessage.classList.add('hidden');

        const profile = swipe.profiles[swipe.currentIndex];
        const cardHtml = `
            <div class="absolute w-full max-w-sm card p-6 text-center" style="box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);">
                <img src="${profile.profile_picture_url || 'https://via.placeholder.com/200'}" alt="${profile.username}" class="w-48 h-48 rounded-full object-cover mx-auto mb-4">
                <h3 class="text-2xl font-bold text-gray-800">${profile.username}, ${swipe.getAge(profile.dob)}</h3>
                <p class="text-gray-600">${profile.location}</p>
                <p class="text-gray-700 mt-2">${profile.bio || 'No bio available.'}</p>
            </div>
        `;
        swipe.swipeCardContainer.innerHTML = cardHtml;
    },

    showNoMoreProfiles: () => {
        swipe.swipeCardContainer.innerHTML = '';
        swipe.noMoreProfilesMessage.classList.remove('hidden');
    },

    handleSwipe: async (action) => {
        if (swipe.profiles.length === 0 || swipe.currentIndex >= swipe.profiles.length) {
            return; // No profiles to swipe
        }

        const currentProfile = swipe.profiles[swipe.currentIndex];
        const likedUserId = currentProfile.id;

        try {
            let response;
            if (action === 'like') {
                response = await api.request('/matches/like', 'POST', { likedUserId });
            } else if (action === 'dislike') {
                response = await api.request('/matches/dislike', 'POST', { dislikedUserId: likedUserId });
            }

            if (response.matched) {
                alert(`It's a match with ${currentProfile.username}!`);
                app.showSection('matches-section'); // Redirect to matches
                // Or you could show a modal, etc.
            }

            swipe.currentIndex++;
            swipe.displayCurrentProfile();
        } catch (error) {
            alert('Failed to process swipe: ' + error.message);
            console.error('Swipe error:', error);
        }
    },

    getAge: (dobString) => {
        if (!dobString) return 'N/A';
        const dob = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    }
};