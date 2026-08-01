import { api } from './api';

export function getPizzas() {
  return api.get('/pizza/getPizza');
}

export function addPizza(payload) {
  return api.post('/pizza/addPizza', payload);
}

export function updatePizza(id, payload) {
  return api.patch(`/pizza/updatePizza/${id}`, payload);
}
