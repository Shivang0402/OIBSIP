const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_NAME_LENGTH = 50;

const isValidEmail = (email) => EMAIL_REGEX.test(email);
const isValidPhone = (phone) => PHONE_REGEX.test(phone);
const isStrongEnough = (password) => password.length >= MIN_PASSWORD_LENGTH;

module.exports = {
  isValidEmail,
  isValidPhone,
  isStrongEnough,
  MIN_PASSWORD_LENGTH,
  MAX_NAME_LENGTH,
};
