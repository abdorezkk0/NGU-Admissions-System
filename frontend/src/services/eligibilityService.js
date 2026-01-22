import api from './api';

const eligibilityService = {
  // Get eligibility requirements
  getRequirements: async () => {
    const response = await api.get('/api/eligibility/requirements');
    return response.data;
  },

  // Evaluate eligibility for an application (staff only)
  evaluateEligibility: async (applicationId) => {
    const response = await api.post(`/api/eligibility/evaluate/${applicationId}`);
    return response.data;
  },

  // Get eligibility result for an application
  getResult: async (applicationId) => {
    const response = await api.get(`/api/eligibility/result/${applicationId}`);
    return response.data;
  },

  // Get all my eligibility results (student)
  getMyResults: async () => {
    const response = await api.get('/api/eligibility/my-results');
    return response.data;
  },

  // Get all eligibility results (staff/admin)
  getAllResults: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/api/eligibility/results?${params}`);
    return response.data;
  },
};

export default eligibilityService;