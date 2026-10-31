// ============================================================
// FIN-GAP RWANDA — API Service Layer
// All HTTP calls to the PHP backend go through this file
// Hardcoded to Render production backend with local fallback
// ============================================================

import axios from 'axios';

// Automatically uses REACT_APP_API_URL if set in Vercel,
// otherwise defaults to your live Render backend URL.
const API_BASE = (
  process.env.REACT_APP_API_URL || 'https://fin-gap-rwanda-project.onrender.com'
).replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Fetch national-level KPI summary
export const fetchNationalSummary = () =>
  api.get('/national-summary.php').then(r => r.data.data);

// Fetch all districts (with optional filters)
export const fetchDistricts = (params = {}) =>
  api.get('/districts.php', { params }).then(r => r.data);

// Fetch single district full detail
export const fetchDistrict = (id) =>
  api.get(`/district-detail.php?id=${id}`).then(r => r.data.data);

// Run policy simulation
export const runSimulation = (payload) =>
  api.post('/simulate.php', payload).then(r => r.data);

export default api;