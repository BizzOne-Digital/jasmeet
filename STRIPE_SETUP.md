# Stripe Payment Integration Setup Guide

## 📋 Overview
This guide will help you set up Stripe payments for the DAYAURA e-commerce store.

## 🚀 Quick Setup Steps

### 1. Install Stripe Dependencies

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or log in
3. Navigate to **Developers → API keys**
4. Copy your keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

### 3. Add Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### 4. Test in Development Mode

Use Stripe's test mode keys (they start with `sk_test_` and `pk_test_`)

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

Use any future date for expiry, any 3 digits for CVC, and any postal code.

### 5. Setup Webhooks (Required for Production)

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your endpoint URL:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret** and add it to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### 6. Test Webhook Locally (Optional)

Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Forward webhook events to local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook signing secret for local testing.

## 🔧 Implementation Details

### Files Created:

1. **`src/lib/stripe.ts`** - Stripe client initialization
2. **`src/app/api/create-payment-intent/route.ts`** - Creates payment intent
3. **`src/app/api/webhooks/stripe/route.ts`** - Handles Stripe webhooks
4. **`src/components/checkout/StripePaymentForm.tsx`** - Payment form UI

### How It Works:

1. **Checkout Page** - User fills in shipping details
2. **Payment Intent** - Server creates a Stripe payment intent
3. **Payment Form** - User enters card details (handled by Stripe)
4. **Webhook** - Stripe notifies us of payment status
5. **Order Update** - Order status is updated based on payment

## 🧪 Testing

### Test Mode (Development):
- Use test API keys
- Use test card numbers
- No real charges are made

### Production Mode:
- Replace test keys with live keys
- Real charges will be processed
- Ensure webhooks are properly configured

## ⚙️ Integration with CheckoutClient

Update `src/components/checkout/CheckoutClient.tsx` to integrate Stripe:

```tsx
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { StripePaymentForm } from "@/components/checkout/StripePaymentForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// In your component:
const [clientSecret, setClientSecret] = useState("");

// After creating order, create payment intent:
const response = await fetch("/api/create-payment-intent", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: total,
    orderId: order._id,
    customerEmail: order.email,
  }),
});
const { clientSecret } = await response.json();
setClientSecret(clientSecret);

// Render Stripe payment form:
{clientSecret && (
  <Elements stripe={stripePromise} options={{ clientSecret }}>
    <StripePaymentForm
      amount={total}
      onSuccess={(paymentIntentId) => {
        // Handle success
      }}
      onError={(error) => {
        // Handle error
      }}
    />
  </Elements>
)}
```

## 🔒 Security Notes

- Never expose your secret key (`sk_test_` or `sk_live_`) in client-side code
- Always validate webhook signatures
- Use HTTPS in production
- Keep your webhook secret secure

## 📊 Going Live Checklist

- [ ] Replace test keys with live keys
- [ ] Configure production webhook endpoint
- [ ] Test with real card (small amount)
- [ ] Set up proper error monitoring
- [ ] Review Stripe Dashboard settings
- [ ] Enable fraud prevention (Radar)
- [ ] Configure email receipts in Stripe

## 💡 Additional Features

### Available Payment Methods:
- Credit/Debit Cards
- Apple Pay
- Google Pay
- Link (Stripe's one-click checkout)

All enabled by default with `automatic_payment_methods: { enabled: true }`

## 🆘 Troubleshooting

**Payment Intent Creation Fails:**
- Check if STRIPE_SECRET_KEY is set correctly
- Verify amount is greater than 0
- Check server logs for detailed error

**Webhook Not Receiving Events:**
- Verify webhook URL is correct
- Check webhook signing secret
- Test with Stripe CLI locally first

**Payment Form Not Showing:**
- Check if NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set
- Verify clientSecret is created successfully
- Check browser console for errors

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Next.js Stripe Integration](https://vercel.com/guides/getting-started-with-nextjs-typescript-stripe)

## 🎯 Next Steps

1. Install dependencies: `npm install stripe @stripe/stripe-js @stripe/react-stripe-js`
2. Add your Stripe keys to `.env.local`
3. Integrate StripePaymentForm in CheckoutClient
4. Test with test cards
5. Setup webhooks
6. Go live! 🚀
