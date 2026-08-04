export const STATUS_ALIASES = {
  'Order Recevied': 'Order Received',
  Delievered: 'Delivered',
};

export function canonicalStatus(status) {
  return STATUS_ALIASES[status] || status || 'Pending';
}

export const TRACK_STEPS = ['Order Received', 'In Kitchen', 'Sent to Delivery'];

export const TERMINAL_STATUSES = ['Cancelled', 'Sent to Delivery', 'Delivered'];

export function stepIndexForStatus(status) {
  return TRACK_STEPS.indexOf(canonicalStatus(status));
}

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(canonicalStatus(status));
}

export function isCurrentOrder(order) {
  return !TERMINAL_STATUSES.includes(canonicalStatus(order.orderStatus));
}

export function needsPayment(order) {
  return Boolean(order) && order.paymentStatus !== 'Paid';
}
