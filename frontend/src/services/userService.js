import apiClient from '../api/apiClient';

const userService = {
  /**
   * Get list of all registered users
   */
  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  }
};

export default userService;
