const auth = {
    register: async (username, email, password, gender, interested_in, dob, location) => {
        try {
            const data = await api.request('/auth/register', 'POST', { username, email, password, gender, interested_in, dob, location });
            api.setToken(data.token);
            return data.user;
        } catch (error) {
            alert(error.message);
            return null;
        }
    },

    login: async (email, password) => {
        try {
            const data = await api.request('/auth/login', 'POST', { email, password });
            api.setToken(data.token);
            return data.user;
        } catch (error) {
            alert(error.message);
            return null;
        }
    },

    logout: () => {
        api.removeToken();
        // Redirect to login or home
        window.location.hash = '#login';
        window.location.reload(); // Simple reload for full state reset
    },

    isAuthenticated: () => {
        return !!api.getToken();
    },

    getMe: async () => {
        try {
            if (!auth.isAuthenticated()) return null;
            const data = await api.request('/auth/me');
            return data;
        } catch (error) {
            console.error("Failed to fetch current user:", error);
            auth.logout(); // If token is invalid, log out
            return null;
        }
    }
};