declare global {
  interface Window {
    Stripe?: StripeGlobal;
  }
}

export const loadStripe = async (): Promise<StripeGlobal> => {
  if (typeof window !== 'object') throw new TypeError('Not in browser-like environment.');
  if (window.Stripe) return window.Stripe;

  let script: HTMLScriptElement | null = document.getElementById('stripe-js') as (HTMLScriptElement | null);

  if (!script) {
    script = document.createElement('script');
    script.id = 'stripe-js';
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    document.head.appendChild(script);
  }

  await new Promise<void>((r) => setTimeout(r, 10));
  if (!window.Stripe) {
    await new Promise<any>((r) => script!.addEventListener('load', r));
  }

  if (!window.Stripe) throw new Error('Could not load ' + script.src);
  return window.Stripe;
};

export const getStripe = (): StripeGlobal => {
  if (typeof window !== 'object') throw new TypeError('Not in browser-like environment.');
  if (!window.Stripe) throw new Error('Stripe not loaded.');
  return window.Stripe;
};

export type StripeGlobal = (pk: string) => Stripe;

export interface Stripe {
  paymentRequest(config: StripePaymentRequestOptions): PaymentRequest;
  elements(): StripeElements;
  createToken();
  createSource();
  retrieveSource();
  redirectToCheckout();
  retrievePaymentIntent();
  handleCardPayment();
  confirmPaymentIntent();
}

export interface StripeAmount {
  amount: number;
  label: string;
  pending?: boolean;
}

export interface StripeShippingOptions {
  id: string;
  label: string;
  details: string;
  amount: string;
}

export interface StripePaymentRequestOptions {
  country: string;
  currency: string;
  total: StripeAmount;
  displayItems: StripeAmount[];
  requestPayerName?: boolean;
  requestPayerEmail?: boolean;
  requestPayerPhone?: boolean;
  requestShipping?: boolean;
  shippingOptions?: StripeShippingOptions[];
}

export interface StripeElements {
  create(
    name: string,
    config: {
      paymentRequest: PaymentRequest;
      style: any;
    },
  ): StripePaymentRequestButton;
}

export interface StripePaymentRequestButton {
  mount(id: string);
}
