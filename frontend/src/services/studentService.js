import api from './api';

export const studentService = {
  getQuizzes: async (params = {}) => {
    const cleanParams = {};
    if (params.q) cleanParams.q = params.q;
    if (params.categoryId) cleanParams.categoryId = params.categoryId;
    if (params.difficulty && params.difficulty !== 'ALL') cleanParams.difficulty = params.difficulty;
    if (params.sort) cleanParams.sort = params.sort;
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.size !== undefined) cleanParams.size = params.size;

    return api.get('/quizzes', { params: cleanParams });
  },

  getQuizById: async (id) => {
    return api.get(`/quizzes/${id}`);
  },

  getDashboard: async () => {
    return api.get('/me/dashboard');
  },

  getProfile: async () => {
    return api.get('/me/profile');
  },

  updateProfile: async (data) => {
    return api.put('/me/profile', data);
  },

  changePassword: async (currentPassword, newPassword) => {
    return api.put('/me/password', { currentPassword, newPassword });
  }
};

