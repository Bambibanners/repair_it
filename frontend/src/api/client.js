import axios from 'axios';

const API_BASE = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardStats = async () => {
  const res = await api.get('/dashboard/stats');
  return res.data;
};

export const getInventory = async (params = {}) => {
  const res = await api.get('/inventory/', { params });
  return res.data;
};

export const getUnitDetail = async (id) => {
  const res = await api.get(`/inventory/${id}`);
  return res.data;
};

export const createUnitIntake = async (data) => {
  const res = await api.post('/inventory/', data);
  return res.data;
};

export const updateUnitStatus = async (id, status) => {
  const res = await api.put(`/inventory/${id}/status`, { system_status: status });
  return res.data;
};

export const updateUnit = async (id, data) => {
  const res = await api.put(`/inventory/${id}`, data);
  return res.data;
};

export const updateRepairLog = async (id, data) => {
  const res = await api.put(`/inventory/${id}/repair`, data);
  return res.data;
};

export const addPartOrder = async (id, data) => {
  const res = await api.post(`/inventory/${id}/parts`, data);
  return res.data;
};

export const updatePartOrder = async (partId, data) => {
  const res = await api.put(`/parts/${partId}`, data);
  return res.data;
};

export const deletePartOrder = async (partId) => {
  await api.delete(`/parts/${partId}`);
};

export const createSalesListing = async (id, data) => {
  const res = await api.post(`/inventory/${id}/sales`, data);
  return res.data;
};

export const updateSalesListing = async (listingId, data) => {
  const res = await api.put(`/sales/${listingId}`, data);
  return res.data;
};

export const getNetProfit = async (id) => {
  const res = await api.get(`/finance/profit/${id}`);
  return res.data;
};

export const uploadUnitMedia = async (id, formData) => {
  const res = await api.post(`/inventory/${id}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getUnitMedia = async (id) => {
  const res = await api.get(`/inventory/${id}/media`);
  return res.data;
};

export const deleteUnitMedia = async (mediaId) => {
  await api.delete(`/media/${mediaId}`);
};

export const uploadServiceManual = async (formData) => {
  const res = await api.post('/manuals/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const searchServiceManuals = async (brand, modelNumber) => {
  const res = await api.get('/manuals/search', {
    params: { brand, model_number: modelNumber }
  });
  return res.data;
};
