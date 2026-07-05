import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the user is unauthorized (401)
    if (error.response && error.response.status === 401) {
      // Optional: perform automatic redirect to login or clear token from localStorage if any.
      // But we will let the Context handle the user state reset.
      console.warn('Session expired or unauthorized request. Please log in.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
