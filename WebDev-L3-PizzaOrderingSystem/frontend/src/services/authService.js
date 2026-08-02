import { api } from './api';

export function registerUser(payload) {
  return api.post('/auth/register', payload);
}

export function verifyEmail(token) {
  return api.get(`/auth/verifyemail/${token}`);
}

export function loginUser(payload) {
  return api.post('/auth/login', payload);
}

export function forgotPassword(email) {
  return api.post('/auth/forgotpass', { email });
}

export function resetPassword(token, payload) {
  return api.patch(`/auth/resetpass/${token}`, payload);
}

export function getProfile() {
  return api.get('/auth/profile');
}

export function updateProfile(payload) {
  return api.patch('/auth/profile', payload);
}

export function changePassword(payload) {
  return api.post('/auth/changepass', payload);
}
