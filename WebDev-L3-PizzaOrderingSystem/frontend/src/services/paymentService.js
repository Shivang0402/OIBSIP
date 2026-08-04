import { retryPayment, verifyPayment } from './orderService';
import { getUser } from './session';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export const PAYMENT_DISMISSED = 'PAYMENT_DISMISSED';
export const PAYMENT_FAILED = 'PAYMENT_FAILED';

let scriptPromise = null;

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve();

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Unable to load the payment gateway. Please try again.'));
      };
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
}

export function openRazorpayCheckout({
  key,
  amount,
  currency,
  orderId,
  name = 'PizzaNova',
  description = '',
  prefill = {},
  themeColor = '#f97316',
}) {
  return loadRazorpayScript().then(
    () =>
      new Promise((resolve, reject) => {
        const options = {
          key,
          amount,
          currency,
          name,
          description,
          order_id: orderId,
          prefill,
          theme: { color: themeColor },
          handler: (response) => resolve(response),
          modal: {
            ondismiss: () => reject(new Error(PAYMENT_DISMISSED)),
          },
        };

        try {
          const razorpay = new window.Razorpay(options);
          razorpay.on('payment.failed', (response) => {
            const error = new Error(PAYMENT_FAILED);
            error.description =
              response?.error?.description || 'The payment failed. Please try again.';
            reject(error);
          });
          razorpay.open();
        } catch (error) {
          reject(error);
        }
      }),
  );
}

export async function completeOrderPayment({
  key,
  amount,
  currency,
  orderId,
  orderNumber,
}) {
  const user = getUser();

  const response = await openRazorpayCheckout({
    key,
    amount,
    currency,
    orderId,
    name: 'PizzaNova',
    description: orderNumber ? `Order ${orderNumber}` : '',
    prefill: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  return verifyPayment({
    razorpay_order_id: response.razorpay_order_id,
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_signature: response.razorpay_signature,
  });
}

export async function retryOrderPayment(orderId, orderNumber) {
  const data = await retryPayment(orderId);

  return completeOrderPayment({
    key: data.key,
    amount: data.amount,
    currency: data.currency,
    orderId: data.razorpayOrderId,
    orderNumber: orderNumber || data.order?.orderNumber,
  });
}
