import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const eventsAPI = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
};

export const registrationsAPI = {
  register: (data) => api.post('/registrations', data),
  getUserRegistrations: () => api.get('/registrations/user'),
  getEventRegistrations: (eventId) => api.get(`/registrations/event/${eventId}`),
};

export const leaderboardAPI = {
  getLeaderboard: (limit) => api.get('/leaderboard', { params: { limit } }),
};

export const donationsAPI = {
  createDonation: (data) => api.post('/donations', data),
  getEventDonations: (eventId) => api.get(`/donations/event/${eventId}`),
};

export const adminAPI = {
  getPendingEvents: () => api.get('/admin/events/pending'),
  approveEvent: (eventId) => api.put(`/admin/events/${eventId}/approve`),
};

export const statsAPI = {
  getStats: () => api.get('/stats'),
};

export default api;
