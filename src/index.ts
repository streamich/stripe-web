declare global {
  interface Window {
    Stripe?: StripeGlobal;
  }
}

/**
 * Loads Stripe global object or returns one, if already loaded. This function is
 * idempotent - you can call it as many times as you like. Throws if not successful.
 */
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

/**
 * Synchronously tries to returns Stripe global object. Throws if not successful.
 */
export const getStripe = (): StripeGlobal => {
  if (typeof window !== 'object') throw new TypeError('Not in browser-like environment.');
  if (!window.Stripe) throw new Error('Stripe not loaded.');
  return window.Stripe;
};

export interface StripeInitOptions {
  stripeAccount?: string;
  betas?: string[];
}

export type StripeGlobal = (pk: string, options: StripeInitOptions) => Stripe;

export interface Stripe {
  paymentRequest(options: StripePaymentRequestOptions): StripePaymentRequest;
  elements(options?: StripeElementsOptions): StripeElements;
  /**
   * See https://stripe.com/docs/stripe-js/reference#stripe-confirm-payment-intent
   */
  confirmPaymentIntent(clientSecret: string, element: StripeElement, data: StripeConfirmPaymentIntentData): Promise<StripePaymentResult>;
  /**
   * @param clientSecret the client secret of the PaymentIntent.
   * @param data to be sent with the request.
   */
  confirmPaymentIntent(clientSecret: string, data: StripeConfirmPaymentIntentData2): Promise<StripePaymentResult>;
  /**
   * Use `stripe.handleCardPayment(clientSecret, cardElement[, data])` when the customer submits your payment form.
   * It will gather payment information from `cardElement`, along with any other `data` you provide,
   * and attempt to advance the PaymentIntent towards completion.
   *
   * If you are using [dynamic 3D Secure](https://stripe.com/docs/payments/3d-secure#three-ds-radar), `handleCardPayment`
   * will trigger your Radar rules to execute and may open a dialog for your customer to authenticate their payment.
   *
   * Note that `stripe.handleCardPayment` may take several seconds to complete. During that time,
   * you should disable your form from being resubmitted and show a waiting indicator like a spinner.
   * If you receive an error result, you should be sure to show that error to the customer,
   * re-enable the form, and hide the waiting indicator.
   *
   * Additionally, `stripe.handleCardPayment` can sometimes trigger a [3D Secure](https://stripe.com/docs/payments/3d-secure) challenge.
   * The 3DS challenge requires a context switch that can be hard to follow on a screen-reader.
   * Make sure that your form is accessible by ensuring that success or error messages are clearly read out.
   *
   * @param clientSecret the client secret of the PaymentIntent.
   * @param cardElement a card Element that will be used to create a payment method.
   * @param data to be sent with the request.
   */
  handleCardPayment(clientSecret: string, cardElement: StripeElement, data?: StripeHandleCardPaymentData1): Promise<StripePaymentResult>;
  /**
   * Use stripe.handleCardPayment(clientSecret, data) to advance the PaymentIntent
   * towards completion when you are not gathering payment method information from an Element.
   * @param clientSecret the client secret of the PaymentIntent.
   * @param data to be sent with the request.
   */
  handleCardPayment(clientSecret: string, data?: StripeHandleCardPaymentData2): Promise<StripePaymentResult>;
  createToken();
  createSource();
  retrieveSource();
  /**
   * Use `stripe.redirectToCheckout` to redirect your customers to [Checkout](https://stripe.com/docs/payments/checkout),
   * a Stripe-hosted page to securely collect payment information. When the customer completes their purchase,
   * they are redirected back to your website.
   */
  redirectToCheckout(opts: StripeRedirectToCheckoutOptions): Promise<any>;
  retrievePaymentIntent();
}

interface StripeRedirectToCheckoutOptions {
  /**
   * An array of objects representing the items that your customer would like to
   * purchase. These items are shown as line items in the Checkout interface and
   * make up the total amount to be collected by Checkout.
   */
  items: Array<StripePlanDetails | StripeProductDetails>;
  /**
   * The URL to which Stripe should send customers when payment is complete.
   */
  successUrl: string;
  /**
   * The URL to which Stripe should send customers when payment is canceled.
   */
  cancelUrl: string;
  /**
   * A unique string to reference the Checkout session. This can be a customer
   * ID, a cart ID, or similar. It is included in the `checkout.session.completed`
   * webhook and can be used to fulfill the purchase.
   */
  clientReferenceId?: string;
  /**
   * The email address used to create the customer object. If you already know
   * your customer's email address, use this attribute to prefill it on Checkout.
   */
  customerEmail?: string;
  /**
   * This is the ID of the Checkout Session API that is used in Checkout's server integration.
   */
  sessionId?: string;
  /**
   * The IETF language tag of the locale to display Checkout in. Default is `'auto'`
   * (Stripe detects the locale of the browser).
   */
  locale?: StripeLocale;
}

interface StripePlanDetails {
  /**
   * The ID of the plan that the customer would like to subscribe to.
   */
  plan: string;
  /**
   * The quantity of units for the item.
   */
  quantity: number;
}

interface StripeProductDetails {
  /**
   * The ID of the SKU that the customer would like to purchase.
   */
  sku: string,
  /**
   * The quantity of units for the item.
   */
  quantity: number
}

export type StripeLocale = 'da' | 'de' | 'en' | 'es' | 'fi' | 'fr' | 'it' | 'ja' | 'nb' | 'nl' | 'pl' | 'pt' | 'sv' | 'zh';

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
  displayItems?: StripeAmount[];
  requestPayerName?: boolean;
  requestPayerEmail?: boolean;
  requestPayerPhone?: boolean;
  requestShipping?: boolean;
  shippingOptions?: StripeShippingOptions[];
}

export interface StripePaymentRequest {
  /**
   * Returns a `Promise` that resolves with a payload if a browser payment API is
   * available. If no API is available, it resolves with `null`.
   */
  canMakePayment(): Promise<null | true | {applePay: boolean}>;
  /**
   * Shows the browser’s payment interface. When using the `paymentRequestButton`
   * Element, this is called for you under the hood. This method must be called
   * as the result of a user interaction (for example, in a click handler).
   */
  show();
  /**
   * PaymentRequest instances can be updated with an `options` object.
   */
  update(options: StripePaymentRequestUpdateOptions);
  /**
   * PaymentRequest instances receive events.
   */
  on(event: 'token' | 'source' | 'cancel' | 'shippingaddresschange' | 'shippingoptionchange', handler: (payload: any) => void);
  on(event: 'token', handler: (payload: StripePaymentResponseToken) => void);
  on(event: 'source', handler: (payload: StripePaymentResponseSource) => void);
  on(event: 'cancel', handler: () => void);
  on(event: 'shippingaddresschange', handler: (payload: {
    updateWith: (...args: any[]) => any;
    shippingAddress: object;
  }) => void);
  on(event: 'shippingoptionchange', handler: (pyaload: {
    updateWith: (...args: any[]) => any;
    shippingAddress: object;
  }) => void);
}

export interface StripePaymentRequestUpdateOptions {
  /**
   * Three character currency code (e.g., `'usd'`).
   */
  currency?: string;
  /**
   * A payment item object. This payment item is shown to the customer in the
   * browser‘s payment interface.
   */
  total?: StripeAmount;
  /**
   * An array of payment item objects. These payment items are shown as line items
   * in the browser‘s payment interface. Note that the sum of the line item amounts
   * does not need to add up to the `total` amount above.
   */
  displayItems?: StripeAmount[];
  /**
   * An array of ShippingOption objects. The first shipping option listed appears
   * in the browser payment interface as the default option.
   */
  shippingOptions?: StripeShippingOptions[];
}

export interface StripePaymentResponseBase {
  complete: (res: 'success' | 'fail' | 'invalid_payer_name' | 'invalid_payer_phone' | 'invalid_payer_email' | 'invalid_shipping_address') => void;
  payerName: string;
  payerEmail: string;
  payerPhone: string;
  shippingAddress: object;
  shippingOption: object;
  methodName: string;
}

export interface StripePaymentResponseToken extends StripePaymentResponseBase {
  token: StripeTokenObject;
}

export interface StripePaymentResponseSource extends StripePaymentResponseBase {
  source: StripeSourceObject;
}

/**
 * This object is returned as the payload of the token and source event handlers.
 */
export type StripePaymentResponse = StripePaymentResponseToken | StripePaymentResponseSource;

export interface StripeTokenObject {
  /**
   * Unique identifier for the object.
   */
  id: string;
  /**
   * String representing the object’s type. Objects of the same type share the same value.
   */
  object: 'token';
  /**
   * Hash describing the bank account.
   */
  bank_account: {
    id: string;
    object: 'bank_account';
    account_holder_name: string;
    account_holder_type: 'individual' | 'company';
    bank_name: string;
    country: string;
    currency: string;
    fingerprint: string;
    last4: string;
    routing_number: string;
    status: 'new' | 'validated' | 'verified' | 'verification_failed' | 'errored';
  };
  /**
   * Hash describing the card used to make the charge.
   */
  card: object;
  client_ip: string;
  created: string;
  livemode: boolean;
  type: 'account' | 'bank_account' | 'card' | 'pii';
  used: boolean;
}

export interface StripeSourceObject {
  /**
   * Unique identifier for the object.
   */
  id: string;
  /**
   * String representing the object’s type. Objects of the same type share the same value.
   */
  object: 'source';
  amount: number;
  client_secret: string;
  code_verification: {
    attempts_remaining: number;
    status: string;
  };
  created: string;
  currency: string;
  customer: string;
  flow: 'redirect' | 'receiver' | 'code_verification' | 'none';
  livemode: boolean;
  metadata: object;
  owner: object;
  receiver: object;
  redirect: object;
  statement_descriptor: string;
  status: string;
  type: string;
  usage: string;
}

export type StripeElementsFontsOption = {
  /**
   * A relative or absolute URL pointing to a CSS file with @font-face definitions, for example:
   * `"https://fonts.googleapis.com/css?family=Open+Sans"`.
   * Note that if you are using a
   * [content security policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) (CSP),
   * [additional directives](https://stripe.com/docs/security#content-security-policy) may be necessary.
   */
  cssSrc: string;
} | {
  /**
   * The name to give the font.
   */
  family: string;
  /**
   * A valid [src](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/src) value
   * pointing to your custom font file. This is usually (though not always) a link
   * to a file with a `.woff`, `.otf`, or `.svg` suffix.
   */
  src: string;
  /**
   * A valid [font-display](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display) value.
   */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  /**
   * One of `'normal'`, `'italic'`, `'oblique'`. Defaults to `'normal'`.
   */
  style?: 'normal' | 'italic' | 'oblique';
  /**
   * A valid [unicode-range](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range) value.
   */
  unicodeRange?: string;
  /**
   * A valid [font-weight](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight).
   * Note that this is a string, not a number.
   */
  weight?: string;
};

export interface StripeElementsOptions {
  /**
   * An array of custom fonts, which Elements created from the elements object can use.
   * Fonts can either be loaded via a CSS file by passing an object with the cssSrc attribute.
   */
  fonts?: StripeElementsFontsOption[];
  /**
   * The [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) of the
   * locale to display placeholders and error strings in. Setting the locale does
   * not affect the behavior of [postal code validation](https://stripe.com/docs/stripe-js/reference#postal-code-formatting)—a valid
   * postal code for the billing country of the card is still required. Default is
   * 'auto' (Stripe detects the locale of the browser).
   *
   * Supported values are: `ar`, `da`, `de`, `en`, `es`, `fi`, `fr`, `he`, `it`, `ja`, `no`, `nl`, `pl`, `sv`, `zh`.
   */
  locale?: string;
}

export type StripeElementType = 'card' | 'cardNumber' | 'cardExpiry' | 'cardCvc' | 'paymentRequestButton' | 'iban' | 'idealBank';

export interface StripeElementStyles {
  color?: any,
  fontFamily?: any,
  fontSize?: any,
  fontSmoothing?: any,
  fontStyle?: any,
  fontVariant?: any,
  fontWeight?: any,
  iconColor?: any,
  lineHeight?: any,
  letterSpacing?: any,
  textAlign?: any,
  padding?: any,
  textDecoration?: any,
  textShadow?: any,
  textTransform?: any,
  ':hover'?: any,
  ':focus'?: any,
  '::placeholder'?: any,
  '::selection'?: any,
  ':-webkit-autofill'?: any,
  ':disabled'?: any,
  '::-ms-clear'?: any,
}

export interface StripeElementOptions {
  classes?: {
    base?: string;
    complete?: string;
    empty?: string;
    focus?: string;
    invalid?: string;
    webkitAutofill?: string;
  };
  style?: {
    base?: StripeElementStyles;
    complete?: StripeElementStyles;
    empty?: StripeElementStyles;
    invalid?: StripeElementStyles;
  };
}

export interface StripeElementOptionsCard extends StripeElementOptions {
  value?: object;
  hidePostalCode?: boolean;
  iconStyle?: 'solid' | 'default';
  hideIcon?: boolean;
  disabled?: boolean;
}

export interface StripeElementOptionsCard2 extends StripeElementOptions {
  placeholder?: string;
  disabled?: boolean;
}

export interface StripeElementOptionsIban extends StripeElementOptions {
  supportedCountries: string;
  placeholderCountry?: string;
  iconStyle?: string;
  hideIcon?: boolean;
  disabled?: boolean;
}

export interface StripeElementOptionsIdealBank extends StripeElementOptions {
  value?: string;
  hideIcon?: boolean;
  disabled?: boolean;
}

export interface StripeElementOptionsPaymentRequest {
  classes?: {
    base?: string;
    complete?: string;
    empty?: string;
    focus?: string;
    invalid?: string;
    webkitAutofill?: string;
  };
  style?: {
    paymentRequestButton?: StripeElementStyles;
  };
  paymentRequest: PaymentRequest;
}

export interface StripeElements {
  create(type: StripeElementType, options?): StripeElement;
  create(type: 'card', options?: StripeElementOptionsCard): StripeElement;
  create(type: 'cardNumber' | 'cardExpiry' | 'cardCvc', options?: StripeElementOptionsCard2): StripeElement;
  create(type: 'paymentRequest', options?: StripeElementOptionsPaymentRequest): StripeElement;
  create(type: 'iban', options?: StripeElementOptionsIban): StripeElement;
}

export interface StripeElementChangeEventPayload {
  empty: boolean;
  complete: boolean;
  error: {
    type: 'validation_error';
    message: string;
    code: number | string;
  };
  value?: string | object;
  brand?: string;
  country?: string;
  bankName?: string;
}

export interface StripeElement {
  mount(domElement: string | HTMLElement);
  on(event: 'blur' | 'change' | 'click' | 'focus' | 'ready', handler: (payload?: object) => void);
  on(event: 'blur', handler: () => void);
  on(event: 'change', handler: (payload: StripeElementChangeEventPayload) => void);
  on(event: 'click', handler: (payload: {preventDefault: () => void}) => void);
  addEventListener(event: 'blur' | 'change' | 'click' | 'focus' | 'ready', handler: (payload?: object) => void);
  addEventListener(event: 'blur', handler: () => void);
  addEventListener(event: 'change', handler: (payload: StripeElementChangeEventPayload) => void);
  addEventListener(event: 'click', handler: (payload: {preventDefault: () => void}) => void);
  /**
   * Blurs the Element.
   */
  blur();
  /**
   * Clears the value(s) of the Element.
   */
  clear();
  /**
   * Removes the Element from the DOM and destroys it. Note: a destroyed Element
   * can not be re-activated or re-mounted to the DOM.
   */
  destroy();
  /**
   * Focuses the Element.
   */
  focus();
  /**
   * Unmounts the Element from the DOM. Call element.mount() to re-attach it to the DOM.
   */
  unmount();
  update();
}

export interface StripeConfirmPaymentIntentData {
}

export interface StripeConfirmPaymentIntentData2 {
  /**
   * Only one of `return_url` or `use_stripe_sdk` is required. If you are handling
   * next actions yourself, pass in a `return_url`. If the subsequent action is
   * `redirect_to_url`, this URL will be used on the return path for the redirect.
   * If you want to confirm the PaymentIntent and then later use `stripe.handleCardPayment`
   * to complete the payment, set `use_stripe_sdk` to `true` instead.
   */
  return_url?: string;
  /**
   * Only one of `return_url` or `use_stripe_sdk` is required. If you are handling
   * next actions yourself, pass in a `return_url`. If the subsequent action is
   * `redirect_to_url`, this URL will be used on the return path for the redirect.
   * If you want to confirm the PaymentIntent and then later use `stripe.handleCardPayment`
   * to complete the payment, set `use_stripe_sdk` to `true` instead.
   */
  use_stripe_sdk?: boolean;
  /**
   * Only one of `source_data` and `source` is required. Use source to specify an
   * existing source to use for this payment. Use `source_data` to convert a token
   * to a source and to supply additional data relevant to the payment method.
   */
  source?: string;
  /**
   * Only one of `source_data` and `source` is required. Use source to specify an
   * existing source to use for this payment. Use `source_data` to convert a token
   * to a source and to supply additional data relevant to the payment method.
   */
  source_data?: {
    owner: object;
    token: string;
  }
  /**
   * The [shipping details](https://stripe.com/docs/api/payment_intents/confirm#confirm_payment_intent-shipping)
   * ffor the payment, if collected.
   */
  shipping?: object;
  /**
   * Email address that the receipt for the resulting payment will be sent to.
   */
  receipt_email?: string;
  /**
   * If the PaymentIntent is associated with a customer and this parameter is set to `true`,
   * the provided source will be attached to the customer. Default is `false`.
   */
  save_payment_method?: boolean;
}

export interface StripePaymentResult {
  paymentIntent?: StripeApiPaymentIntent;
  error?: StripeApiError;
}

export interface StripeHandleCardPaymentData1 {
  source_data: {
    owner?: StripeOwnerAPIOwner;
  };
  /**
   * The [shipping details API](https://stripe.com/docs/api/payment_intents/confirm#confirm_payment_intent-shipping) for the payment, if collected.
   */
  shipping?: object;
  /**
   * Email address that the receipt for the resulting payment will be sent to.
   */
  receipt_email?: string;
  /**
   * If the PaymentIntent is associated with a customer and this parameter is set to `true`,
   * the provided payment method will be attached to the customer. Default is `false`.
   */
  save_payment_method?: boolean;
}

export interface StripeHandleCardPaymentData2 {
  source: string;
  source_data: {
    owner?: StripeOwnerAPIOwner;
    token: string;
  };
  /**
   * The [shipping details API](https://stripe.com/docs/api/payment_intents/confirm#confirm_payment_intent-shipping) for the payment, if collected.
   */
  shipping?: object;
  /**
   * Email address that the receipt for the resulting payment will be sent to.
   */
  receipt_email?: string;
  /**
   * If the PaymentIntent is associated with a customer and this parameter is set to `true`,
   * the provided payment method will be attached to the customer. Default is `false`.
   */
  save_payment_method?: boolean;
}

export interface StripeOwnerAPIOwner {
  address?: {
    city?: string;
    country?: string;
    line1?: string;
    line2?: string;
    postal_code?: string;
    state?: string;
  };
  email?: string;
  name?: string;
  phone?: string;
}

export interface StripeApiPaymentIntent {
  id: string;
  object: 'payment_intent',
  amount: number;
  amount_capturable: number;
  amount_received: number;
  application: string;
  application_fee_amount: number;
  canceled_at: number;
  cancellation_reason: string;
  capture_method: string;
  charges: any[];
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: string;
  description: string;
  last_payment_error: object;
  livemode: boolean;
  metadata: object;
  next_action: object;
  on_behalf_of: string;
  payment_method_types: string[];
  receipt_email: string;
  review: string;
  shipping: object;
  source: string;
  statement_descriptor: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_authorization' | 'requires_capture' | 'canceled' | 'succeeded';
  transfer_data: object;
  transfer_group: string;
}

export interface StripeApiError {
  type: 'api_connection_error' | 'api_error' | 'authentication_error' | 'card_error' | 'idempotency_error' | 'invalid_request_error' | 'rate_limit_error';
  charge: string;
  code: string;
  decline_code: string;
  doc_url: string;
  message: string;
  param: string;
  source: object;
}
