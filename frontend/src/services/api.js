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

// Clean API routes matching the backend router
export const fetchNationalSummary = () =>
  api.get('/api/national-summary').then(r => r.data.data);

export const fetchDistricts = (params = {}) =>
  api.get('/api/districts', { params }).then(r => r.data);

export const fetchDistrict = (id) =>
  api.get(`/api/districts/${id}`).then(r => r.data.data);

export const runSimulation = (payload) =>
  api.post('/api/simulate', payload).then(r => r.data);

export default api;