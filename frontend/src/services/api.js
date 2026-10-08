// ============================================================
// FIN-GAP RWANDA — API Service Layer
// All HTTP calls to the PHP backend go through this file
// PHP dev server routes without /api prefix
// ============================================================

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Fetch national-level KPI summary
export const fetchNationalSummary = () =>
  api.get('/national-summary').then(r => r.data.data);

// Fetch all districts (with optional filters)
export const fetchDistricts = (params = {}) =>
  api.get('/districts', { params }).then(r => r.data);

// Fetch single district full detail
export const fetchDistrict = (id) =>
  api.get(`/districts/${id}`).then(r => r.data.data);

// Run policy simulation
export const runSimulation = (payload) =>
  api.post('/simulate', payload).then(r => r.data);

export default api;
