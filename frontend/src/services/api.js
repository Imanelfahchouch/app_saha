import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gestion des erreurs
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// ✅ Auth
export const loginUser = (email, password) => api.post('/auth/login', { email, password });
export const registerUser = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');

// ✅ Établissements
export const fetchEstablishments = (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.etat) params.append('etat', filters.etat);
  if (filters.search) params.append('search', filters.search);
  return api.get(`/etablissements?${params}`);
};

// ✅ NEAR ME - Fonction manquante (AJOUTÉE)
export const fetchNearbyEstablishments = ({ lat, lng, radius = 5000, type = '' }) => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    radius: radius.toString(),
    ...(type && { type })
  });
  return api.get(`/etablissements/nearby?${params}`);
};

// ✅ Reviews
export const postReview = (data) => api.post('/reviews', data);
export const fetchReviews = (etabId) => api.get(`/etablissements/${etabId}/reviews`);

// ✅ Stats
export const fetchStats = () => api.get('/stats');

export default api;