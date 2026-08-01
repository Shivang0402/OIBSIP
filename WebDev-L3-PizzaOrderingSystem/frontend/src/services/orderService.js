import { api } from './api';

export function getOrders() {
  return api.get('/order/getOrders');
}
