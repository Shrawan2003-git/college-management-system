export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiatePayment = async ({ order, user, event, onSuccess, onFailure }) => {
  const isLoaded = await loadRazorpay();
  if (!isLoaded) {
    alert('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: order.amount,
    currency: order.currency || 'INR',
    name: 'College Event Management',
    description: event?.title || 'Event Registration',
    order_id: order.id,
    prefill: {
      name: user?.name || '',
      email: user?.email || '',
      contact: user?.phone || ''
    },
    theme: { color: '#6C63FF' },
    handler: (response) => onSuccess(response),
    modal: {
      ondismiss: () => onFailure && onFailure('Payment cancelled')
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
