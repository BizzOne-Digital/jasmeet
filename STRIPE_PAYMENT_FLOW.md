# Stripe Payment Flow - Integration Guide

## Overview
आपकी e-commerce site में अब Stripe Checkout integration है। जब user checkout करता है तो:

1. User checkout form भरता है
2. "Pay with Stripe" button दबाता है
3. Order पहले database में save होता है
4. User Stripe payment page पर redirect होता है
5. Payment complete होने के बाद success page पर वापस आता है
6. Confirmation emails भेजे जाते हैं

## Setup Steps

### 1. Stripe Account Configuration

**Stripe Dashboard में जाएं:** https://dashboard.stripe.com

#### Test Mode (Development)
- Toggle को "Test mode" पर रखें
- API keys प्राप्त करें:
  - Publishable key: `pk_test_...`
  - Secret key: `sk_test_...`

#### Live Mode (Production)
- Toggle को "Live mode" पर स्विच करें
- API keys प्राप्त करें:
  - Publishable key: `pk_live_...`
  - Secret key: `sk_live_...`

### 2. Environment Variables

आपकी `.env.local` file में:

```env
# Stripe Keys
# Test Mode के लिए:
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Live Mode के लिए (Production):
# STRIPE_SECRET_KEY=sk_live_your_secret_key_here
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key_here

# Webhook Secret (Stripe Dashboard से प्राप्त करें)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Site URL (Production में अपना domain डालें)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Webhook Setup

Webhooks Stripe से आपकी site को payment events की notification देते हैं।

**Stripe Dashboard में:**
1. Developers → Webhooks पर जाएं
2. "Add endpoint" क्लिक करें
3. Endpoint URL: `https://your-domain.com/api/webhooks/stripe`
   - Local testing: `http://localhost:3000/api/webhooks/stripe`
4. Events चुनें:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. "Add endpoint" क्लिक करें
6. Signing secret को copy करें और `.env.local` में `STRIPE_WEBHOOK_SECRET` में paste करें

#### Local Testing के लिए Stripe CLI

```bash
# Stripe CLI install करें
# Windows: https://github.com/stripe/stripe-cli/releases

# Login करें
stripe login

# Webhook forward करें
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal में webhook secret दिखेगा, उसे .env.local में add करें
```

### 4. Payment Flow Testing

#### Test Mode में Test करें:
1. Test credit cards use करें:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
2. Expiry date: भविष्य की कोई भी तारीख (e.g., 12/25)
3. CVC: कोई भी 3 digits (e.g., 123)
4. ZIP: कोई भी postal code

## How It Works

### Frontend Flow

**CheckoutClient.tsx:**
```typescript
// 1. User form submit करता है
// 2. Order पहले create होता है
const res = await fetch("/api/orders", { ... });

// 3. Stripe Checkout Session बनाता है
const paymentRes = await fetch("/api/create-payment-intent", {
  body: JSON.stringify({
    amount: total,
    orderId,
    customerEmail,
    items,
    shippingAddress
  })
});

// 4. User को Stripe page पर redirect करता है
window.location.href = paymentJson.url;
```

### Backend Flow

**API Routes:**

1. **POST /api/orders** - Order create करता है
   - Order को "pending" payment status के साथ save करता है
   - Order ID return करता है

2. **POST /api/create-payment-intent** - Stripe Checkout Session
   - Stripe Checkout Session बनाता है
   - Success URL: `/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id={ORDER_ID}`
   - Cancel URL: `/checkout?canceled=true`
   - Session URL return करता है

3. **POST /api/verify-payment** - Payment Verification
   - Stripe session verify करता है
   - Payment status "paid" update करता है
   - Confirmation emails भेजता है

4. **POST /api/webhooks/stripe** - Webhook Handler
   - Stripe events handle करता है
   - Payment success/failure update करता है

### Success Page Flow

**CheckoutSuccess.tsx:**
```typescript
// 1. URL से session_id और order_id निकालता है
// 2. /api/verify-payment को call करता है
// 3. Payment verify होता है
// 4. Emails automatically भेजे जाते हैं
// 5. Thank you message show करता है
```

## Email Notifications

Payment successful होने पर 2 emails भेजे जाते हैं:

1. **Customer Email** - Order confirmation
   - Order details
   - Items list
   - Shipping address
   - Total amount

2. **Admin Email** - New order notification
   - Same information as customer
   - Admin dashboard link

Email configuration: `EMAIL_SETUP.md` देखें

## Troubleshooting

### Payment redirect नहीं हो रहा:
- Check browser console for errors
- Verify Stripe keys `.env.local` में correct हैं
- Check `NEXT_PUBLIC_SITE_URL` सही है

### Emails नहीं आ रहीं:
- Verify SMTP settings `EMAIL_SETUP.md` के अनुसार
- Check server logs for email errors
- Verify `ADMIN_EMAIL` `.env.local` में set है

### Webhook errors:
- Verify `STRIPE_WEBHOOK_SECRET` correct है
- Check webhook endpoint accessible है
- Review Stripe Dashboard → Webhooks → Recent events

### Local testing issues:
- Use Stripe CLI for webhook forwarding
- Check port 3000 available है
- Ensure dev server running है

## Production Deployment

**Before going live:**

1. ✅ Test mode में thoroughly test करें
2. ✅ Live Stripe keys add करें
3. ✅ Production domain में webhook setup करें
4. ✅ SSL certificate ensure करें (https)
5. ✅ Email delivery test करें
6. ✅ Error handling verify करें

## Security Notes

- ⚠️ Never commit `.env.local` to git
- ⚠️ Keep webhook secret secure
- ⚠️ Always verify payment on server-side
- ⚠️ Use HTTPS in production
- ⚠️ Monitor Stripe Dashboard for suspicious activity

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test Cards: https://stripe.com/docs/testing
