import axios from 'axios';

const API_URL = "http://127.0.0.1:5000/"


// Create axios instance with credentials
const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

// Auth Service
export const authService = {

    register: async(userData) => {
        const response = await apiClient.post('register', userData);
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    login: async(credentials) => {
        const response = await apiClient.post('login/', credentials);
        // Store the token when login is successful
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },
    logout: async() => {
        try {
            // Send logout request to invalidate token on server
            await apiClient.post('logout/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always remove token from localStorage
            localStorage.removeItem('token');
        }
        return { success: true };
    },
    getCurrentUser: async() => {
        const response = await apiClient.get('user/');
        return response.data;
    },
    // Check if user is authenticated
    isAuthenticated: () => {
        return localStorage.getItem('token') !== null;
    }
};