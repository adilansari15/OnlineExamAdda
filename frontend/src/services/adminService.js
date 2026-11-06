import api from './api';

export const adminService = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getStudents: async (params = {}) => {
    const cleanParams = {};
    if (params.q) cleanParams.q = params.q;
    if (params.enabled !== undefined && params.enabled !== '' && params.enabled !== 'all') {
      cleanParams.enabled = params.enabled === true || params.enabled === 'true';
    }
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.size !== undefined) cleanParams.size = params.size;

    const res = await api.get('/admin/students', { params: cleanParams });
    return res.data;
  },

  getStudentById: async (id) => {
    const res = await api.get(`/admin/students/${id}`);
    return res.data;
  },

  updateStudentStatus: async (id, enabled) => {
    const res = await api.patch(`/admin/students/${id}/status`, { enabled });
    return res.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await api.put('/admin/settings/password', { currentPassword, newPassword });
    return res.data;
  }
};

