export function getOrderItems(order) {
  if (Array.isArray(order.items) && order.items.length > 0) return order.items;
  if (order.pizzaSnapshot) {
    return [
      {
        pizzaId: order.pizza,
        isCustom: false,
        pizzaSnapshot: order.pizzaSnapshot,
        quantity: order.quantity || 1,
        customization: order.customization || {},
        totalPrice: order.totalPrice,
      },
    ];
  }
  return [];
}

export function getOrderNumber(order) {
  return order.orderNumber || String(order._id || '').slice(-8).toUpperCase();
}

export function getOrderItemsLabel(order) {
  const items = getOrderItems(order);
  if (items.length === 0) return 'Unknown item';
  const first = items[0].pizzaSnapshot?.name || 'Unknown item';
  const extraCount = items.length - 1;
  return extraCount > 0 ? `${first} +${extraCount} more` : first;
}
