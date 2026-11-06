import api from './api';

export const examService = {
  startAttempt: async (quizId) => {
    const res = await api.post(`/quizzes/${quizId}/attempts`);
    return res.data;
  },

  getAttempt: async (attemptId) => {
    const res = await api.get(`/attempts/${attemptId}`);
    return res.data;
  },

  autosaveAnswer: async (attemptId, questionId, data) => {
    const res = await api.put(`/attempts/${attemptId}/answers/${questionId}`, data);
    return res.data;
  },

  submitAttempt: async (attemptId) => {
    const res = await api.post(`/attempts/${attemptId}/submit`);
    return res.data;
  }
};

