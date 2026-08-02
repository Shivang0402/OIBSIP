export const STATUS_ALIASES = {
  'Order Recevied': 'Order Received',
  Delievered: 'Delivered',
};

export function canonicalStatus(status) {
  return STATUS_ALIASES[status] || status || 'Pending';
}

export const TRACK_STEPS = [
  'Pending',
  'Confirmed',
  'Order Received',
  'In Kitchen',
  'On the way',
  'Delivered',
];

export const TERMINAL_STATUSES = ['Cancelled', 'Delivered'];

export function stepIndexForStatus(status) {
  return TRACK_STEPS.indexOf(canonicalStatus(status));
}

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.includes(canonicalStatus(status));
}

export function isCurrentOrder(order) {
  return !TERMINAL_STATUSES.includes(canonicalStatus(order.orderStatus));
}
