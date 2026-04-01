import { api } from './client';

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  me: () => api.get('/auth/me'),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken })
};

export const ideaApi = {
  dashboardStartup: () => api.get('/ideas/dashboard/startup'),
  dashboardMentor: () => api.get('/ideas/dashboard/mentor'),
  dashboardAdmin: () => api.get('/ideas/dashboard/admin'),
  listIdeas: (params) => api.get('/ideas', { params }),
  myIdeas: () => api.get('/ideas/my'),
  createIdea: (formData) => api.post('/ideas', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateIdea: (id, payload) => api.patch(`/ideas/my/${id}`, payload),
  deleteIdea: (id) => api.delete(`/ideas/my/${id}`),
  reviewIdea: (id, payload) => api.post(`/ideas/${id}/review`, payload)
};

export const investmentApi = {
  create: (ideaId, payload) => api.post(`/investments/idea/${ideaId}`, payload),
  my: () => api.get('/investments/my'),
  cancel: (id) => api.delete(`/investments/${id}`),
  startup: () => api.get('/investments/startup'),
  updateStatus: (id, status) => api.patch(`/investments/${id}/status`, { status })
};

export const notificationApi = {
  list: () => api.get('/notifications'),
  read: (id) => api.patch(`/notifications/${id}/read`),
  readAll: () => api.patch('/notifications/read-all')
};

export const adminApi = {
  users: () => api.get('/admin/users'),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  updateStatus: (id, status) => api.patch(`/admin/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  investments: () => api.get('/admin/investments'),
  notify: (payload) => api.post('/admin/notify', payload),
  exportIdeas: () => api.get('/admin/export/ideas', { responseType: 'blob' })
};
