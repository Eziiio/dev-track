import apiClient from '../api/apiClient';

const taskService = {
  /**
   * Get list of tasks with filters (projectId, status, priority, assignedTo, search, sortBy, page, limit)
   */
  getTasks: async (params = {}) => {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },

  /**
   * Get single task detail
   */
  getTask: async (id) => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Create a new task (Admin / Member under project bounds)
   */
  createTask: async (taskData) => {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },

  /**
   * Update task details or status (Role checked in backend)
   */
  updateTask: async (id, taskData) => {
    const response = await apiClient.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  /**
   * Delete a task (Admin only)
   */
  deleteTask: async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  }
};

export default taskService;
