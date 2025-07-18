const profile = {
    loadProfile: async (userId = null) => {
        const section = document.getElementById('profile-section');
        const usernameInput = document.getElementById('profile-username');
        const emailInput = document.getElementById('profile-email');
        const bioTextarea = document.getElementById('profile-bio');
        const genderSelect = document.getElementById('profile-gender');
        const interestedInSelect = document.getElementById('profile-interested-in');
        const dobInput = document.getElementById('profile-dob');
        const locationInput = document.getElementById('profile-location');
        const profilePictureDisplay = document.getElementById('profile-picture-display');

        try {
            const currentUser = await auth.getMe();
            if (!currentUser) {
                console.error("User not authenticated.");
                return;
            }
            const data = await api.request(`/users/${currentUser.id}`);

            usernameInput.value = data.username || '';
            emailInput.value = data.email || '';
            bioTextarea.value = data.bio || '';
            genderSelect.value = data.gender || '';
            interestedInSelect.value = data.interested_in || '';
            dobInput.value = data.dob ? new Date(data.dob).toISOString().split('T')[0] : '';
            locationInput.value = data.location || '';
            profilePictureDisplay.src = data.profile_picture_url || 'https://via.placeholder.com/150';

        } catch (error) {
            console.error('Failed to load profile:', error);
            alert('Failed to load profile: ' + error.message);
        }
    },

    updateProfile: async (event) => {
        event.preventDefault();
        const bio = document.getElementById('profile-bio').value;
        const gender = document.getElementById('profile-gender').value;
        const interested_in = document.getElementById('profile-interested-in').value;
        const dob = document.getElementById('profile-dob').value;
        const location = document.getElementById('profile-location').value;

        try {
            await api.request('/users/profile', 'PUT', { bio, gender, interested_in, dob, location });
            alert('Profile updated successfully!');
            app.showSection('profile-section'); // Reload profile data
        } catch (error) {
            alert('Failed to update profile: ' + error.message);
        }
    },

    // Placeholder for profile picture upload
    // uploadProfilePicture: async (file) => {
    //     try {
    //         const formData = new FormData();
    //         formData.append('profilePicture', file);
    //         const data = await api.request('/users/profile/picture', 'POST', formData); // Note: Request body type will be 'multipart/form-data'
    //         document.getElementById('profile-picture-display').src = data.profile_picture_url;
    //         alert('Profile picture uploaded!');
    //     } catch (error) {
    //         alert('Failed to upload picture: ' + error.message);
    //     }
    // }
};