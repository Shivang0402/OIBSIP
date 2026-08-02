import { api } from './api';

export function getInventory(category) {
  return api.get('/inventory/getInventory', {
    params: category ? { category } : undefined,
  });
}

export function addInventory(payload) {
  return api.post('/inventory/addInventory', payload);
}

export function updateInventory(id, payload) {
  return api.patch(`/inventory/updateInventory/${id}`, payload);
}

export function getInventoryStats() {
  return api.get('/inventory/stats');
}
