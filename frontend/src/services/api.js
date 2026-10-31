// frontend/src/services/api.js
import axios from 'axios';

const API_BASE = (
  process.env.REACT_APP_API_URL || 'https://fin-gap-rwanda-project.onrender.com'
).replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Added /api/ prefix to match backend folder routing
export const fetchNationalSummary = () =>
  api.get('/api/national-summary.php').then(r => r.data.data);

export const fetchDistricts = (params = {}) =>
  api.get('/api/districts.php', { params }).then(r => r.data);

export const fetchDistrict = (id) =>
  api.get(`/api/district-detail.php?id=${id}`).then(r => r.data.data);

export const runSimulation = (payload) =>
  api.post('/api/simulate.php', payload).then(r => r.data);

export default api;