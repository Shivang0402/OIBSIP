import { api } from './api';

export function getOrders() {
  return api.get('/order/getOrders');
}

export function getOrderById(id) {
  return api.get(`/order/getOrders/${id}`);
}

export function placeOrder(payload) {
  return api.post('/order/placeOrder', payload);
}

export function verifyPayment(payload) {
  return api.post('/order/verifyPayment', payload);
}

export function markPaymentFailed(id) {
  return api.post(`/order/markPaymentFailed/${id}`);
}

export function retryPayment(id) {
  return api.post(`/order/retryPayment/${id}`);
}

export function updateOrderStatus(id, orderStatus) {
  return api.post(`/order/updateStatus/${id}`, { orderStatus });
}
