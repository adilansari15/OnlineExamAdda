import api from './api';

export const resultService = {
  getResult: async (attemptId) => {
    const res = await api.get(`/attempts/${attemptId}/result`);
    return res.data;
  },

  getMyAttempts: async (page = 0, size = 10) => {
    const res = await api.get('/me/attempts', { params: { page, size } });
    return res.data;
  },

  getPerformance: async () => {
    const res = await api.get('/me/performance');
    return res.data;
  },

  getAdminResults: async (params = {}) => {
    const res = await api.get('/admin/results', { params });
    return res.data;
  }
};

