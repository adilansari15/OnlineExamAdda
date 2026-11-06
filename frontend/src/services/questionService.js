import api from './api';

export const questionService = {
  getQuestions: async ({ q, subjectId, difficulty, page = 0, size = 10, sort = 'id,desc' } = {}) => {
    const params = { page, size, sort };
    if (q) params.q = q;
    if (subjectId) params.subjectId = subjectId;
    if (difficulty && difficulty !== 'ALL') params.difficulty = difficulty;

    return api.get('/admin/questions', { params });
  },

  getQuestionById: async (id) => {
    return api.get(`/admin/questions/${id}`);
  },

  createQuestion: async (data) => {
    return api.post('/admin/questions', data);
  },

  updateQuestion: async (id, data) => {
    return api.put(`/admin/questions/${id}`, data);
  },

  deleteQuestion: async (id) => {
    return api.delete(`/admin/questions/${id}`);
  },
};

export default questionService;

