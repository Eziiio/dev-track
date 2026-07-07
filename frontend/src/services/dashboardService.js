import apiClient from '../api/apiClient';

const dashboardService = {
  /**
   * Get dashboard metrics, progress, deadlines, activities, and chart statistics
   */
  getDashboardData: async () => {
    const response = await apiClient.get('/dashboard');
    return response.data;
  }
};

export default dashboardService;
