export function isRequired(value) {
  return Boolean(value && value.trim());
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isStrongEnough(password) {
  return password.length >= 6;
}

export function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(phone.trim());
}
