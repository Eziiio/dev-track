import apiClient from '../api/apiClient';

const authService = {
  /**
   * Register a new user
   * @param {Object} userData { name, email, password, role }
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Login a user
   * @param {Object} credentials { email, password }
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Logout a user
   */
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current user's profile
   */
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile settings
   * @param {Object} profileData { name, email, avatar, password }
   */
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/auth/profile', profileData);
    return response.data;
  }
};

export default authService;
