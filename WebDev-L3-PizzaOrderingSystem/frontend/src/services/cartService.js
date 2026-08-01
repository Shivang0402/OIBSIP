const CART_KEY = 'pizzanova_cart';

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCart() {
  return readCart();
}

export function getCartCount() {
  return readCart().reduce((count, item) => count + item.quantity, 0);
}

export function addCartItem(item) {
  const items = readCart();
  items.push(item);
  writeCart(items);
}

export function updateCartQuantity(id, quantity) {
  const items = readCart();
  const item = items.find((entry) => entry.id === id);
  if (item && quantity >= 1) {
    item.quantity = quantity;
    writeCart(items);
  }
}

export function removeCartItem(id) {
  writeCart(readCart().filter((item) => item.id !== id));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
