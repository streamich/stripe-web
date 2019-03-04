# stripe-web

- This lib is WIP
- TypeScript typings for Stripe web bundle
- `loadStripe()` loads Stripe bundle from `https://js.stripe.com/v3/`
- `getStripe()` returns global Stripe object, if one present


## Install

```shell
npm i stripe-web
```


## Usage

```js
import {loadStripe, getStripe} from 'stripe-web';

const Stripe = await loadStripe();
const Stripe = getStripe();

const stripe = Stripe('pk_...');

stripe.elements();
stripe.paymentRequest();
/// etc...
```


## License

MIT
