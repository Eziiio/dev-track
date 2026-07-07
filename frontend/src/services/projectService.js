import apiClient from '../api/apiClient';

const projectService = {
  /**
   * Get list of projects with filters (search, page, limit)
   */
  getProjects: async (params = {}) => {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  /**
   * Get single project detail
   */
  getProject: async (id) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  /**
   * Create a new project
   */
  createProject: async (projectData) => {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  },

  /**
   * Update project details or members
   */
  updateProject: async (id, projectData) => {
    const response = await apiClient.put(`/projects/${id}`, projectData);
    return response.data;
  },

  /**
   * Delete a project and cascade tasks
   */
  deleteProject: async (id) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  }
};

export default projectService;
