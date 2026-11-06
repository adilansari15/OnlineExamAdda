import api from './api';

export const quizService = {
  getQuizzes: async ({
    q,
    categoryId,
    status,
    difficulty,
    page = 0,
    size = 10,
    sort = 'id,desc',
  } = {}) => {
    const params = { page, size, sort };
    if (q) params.q = q;
    if (categoryId) params.categoryId = categoryId;
    if (status && status !== 'ALL') params.status = status;
    if (difficulty && difficulty !== 'ALL') params.difficulty = difficulty;

    return api.get('/admin/quizzes', { params });
  },

  getQuizById: async (id) => {
    return api.get(`/admin/quizzes/${id}`);
  },

  createQuiz: async (data) => {
    return api.post('/admin/quizzes', data);
  },

  updateQuiz: async (id, data) => {
    return api.put(`/admin/quizzes/${id}`, data);
  },

  deleteQuiz: async (id) => {
    return api.delete(`/admin/quizzes/${id}`);
  },

  assignQuestions: async (id, data) => {
    return api.put(`/admin/quizzes/${id}/questions`, data);
  },

  publishQuiz: async (id) => {
    return api.post(`/admin/quizzes/${id}/publish`);
  },

  unpublishQuiz: async (id) => {
    return api.post(`/admin/quizzes/${id}/unpublish`);
  },
};

export default quizService;

