const API_BASE_URL = 'http://localhost:3000/api'; // Ensure this matches your backend port

const api = {
    getToken: () => localStorage.getItem('token'),
    setToken: (token) => localStorage.setItem('token', token),
    removeToken: () => localStorage.removeItem('token'),

    getHeaders: () => {
        const headers = {
            'Content-Type': 'application/json'
        };
        const token = api.getToken();
        if (token) {
            headers['x-auth-token'] = token;
        }
        return headers;
    },

    request: async (url, method = 'GET', data = null) => {
        const options = {
            method,
            headers: api.getHeaders()
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Something went wrong with the API request.');
            }
            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }
};