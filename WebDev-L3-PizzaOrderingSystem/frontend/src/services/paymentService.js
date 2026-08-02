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
