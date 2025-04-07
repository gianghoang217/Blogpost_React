import axios from 'axios';

const API_URL = "https://blogpost-flask-tl3m.vercel.app"
// "http://127.0.0.1:5000/"


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
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration (401 errors)
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Clear invalid token
            localStorage.removeItem('access_token');

            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

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
        const response = await apiClient.post('login', credentials);
        // Store the token when login is successful
        if (response.data && response.data.access_token) {
            localStorage.setItem('access_token', response.data.access_token);
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
            localStorage.removeItem('access_token');
        }
        return { success: true };
    },
    getCurrentUser: async() => {
        const response = await apiClient.get('user');
        // Check if the response contains user data
        console.log('Current user data:', response.data);
        return response.data;
    },
    // Check if user is authenticated
    isAuthenticated: () => {
        return localStorage.getItem('token') !== null;
    }
};

// Blog Post Service
export const blogPostService = {
    getAllPosts: async() => {
        const response = await apiClient.get('posts/');
        return response.data;
    },

    getPostById: async(id) => {
        const response = await apiClient.get(`posts/${id}`);
        return response.data;
    },

    createPost: async(postData) => {
        const response = await apiClient.post('posts/', postData);
        return response.data;
    },

    updatePost: async(id, postData) => {
        const response = await apiClient.put(`posts/${id}`, postData);
        return response.data;
    },

    deletePost: async(id) => {
        const response = await apiClient.delete(`posts/${id}`);
        return response.data;
    },
    likePost: async(postId) => {
        try {
            const response = await apiClient.post(`posts/${postId}/like`);
            return response.data;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Failed to like the post');
            }
            throw error;
        }
    },
};