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

export type StripeGlobal = (pk: string) => Stripe;

export interface Stripe {
  paymentRequest(options: StripePaymentRequestOptions): PaymentRequest;
  elements(options?: StripeElementsOptions): StripeElements;
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
  iconsStyle?: string;
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

export interface StripeElement {
  mount(domElement: string | HTMLElement);
  on(event: 'blur' | 'change' | 'click' | 'focus' | 'ready', handler: (payload?: object) => void);
  on(event: 'blur', handler: () => void);
  on(event: 'change', handler: (payload: {
    empty: boolean;
    complete: boolean;
    error: object;
    value?: string | object;
    brand?: string;
    country?: string;
    bankName?: string;
  }) => void);
  on(event: 'click', handler: (payload: {preventDefault: () => void}) => void);
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
