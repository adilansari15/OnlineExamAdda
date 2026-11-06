import api from './api';

export const categoryService = {
  // Public
  getActiveCategories: async () => {
    return api.get('/categories');
  },

  // Admin Categories
  getAdminCategories: async (search) => {
    return api.get('/admin/categories', {
      params: search ? { search } : undefined,
    });
  },

  getAdminCategoryById: async (id) => {
    return api.get(`/admin/categories/${id}`);
  },

  createCategory: async (data) => {
    return api.post('/admin/categories', data);
  },

  updateCategory: async (id, data) => {
    return api.put(`/admin/categories/${id}`, data);
  },

  deleteCategory: async (id) => {
    return api.delete(`/admin/categories/${id}`);
  },

  // Admin Subjects
  getAdminSubjects: async (categoryId, search) => {
    return api.get('/admin/subjects', {
      params: {
        ...(categoryId ? { categoryId } : {}),
        ...(search ? { search } : {}),
      },
    });
  },

  getAdminSubjectById: async (id) => {
    return api.get(`/admin/subjects/${id}`);
  },

  createSubject: async (data) => {
    return api.post('/admin/subjects', data);
  },

  updateSubject: async (id, data) => {
    return api.put(`/admin/subjects/${id}`, data);
  },

  deleteSubject: async (id) => {
    return api.delete(`/admin/subjects/${id}`);
  },
};

export default categoryService;

