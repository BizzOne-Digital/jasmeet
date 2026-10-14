# Email Setup Guide (SMTP)

## 📧 Overview
This guide will help you set up email notifications for:
- ✅ Order confirmations sent to customers
- ✅ New order notifications sent to admin
- ✅ Contact form submissions sent to admin

## 🚀 Quick Setup

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Step Verification** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → Enter "DAYAURA"
   - Click "Generate"
   - Copy the 16-character password

3. **Add to `.env.local`:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
ADMIN_ORDER_EMAIL=your-email@gmail.com
```

### Option 2: SendGrid (Recommended for Production)

1. **Sign up at SendGrid**
   - Go to: https://sendgrid.com/
   - Create free account (100 emails/day free)

2. **Create API Key**
   - Go to Settings → API Keys
   - Create API Key with "Mail Send" permission
   - Copy the API key

3. **Get SMTP Credentials**
   - Username: `apikey` (literally the word "apikey")
   - Password: Your API key from step 2

4. **Add to `.env.local`:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
ADMIN_ORDER_EMAIL=admin@yourdomain.com
```

### Option 3: Other SMTP Providers

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

#### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

#### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587 (or 465 for SSL)
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password
```

## 📋 Environment Variables Explained

### Required Variables:

```env
# SMTP Server Settings
SMTP_HOST=smtp.gmail.com              # Your SMTP server hostname
SMTP_PORT=587                         # Port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com        # SMTP username/email
SMTP_PASS=your-app-password           # SMTP password/app password

# Email Addresses
EMAIL_FROM=noreply@yourdomain.com     # "From" address for outgoing emails
ADMIN_ORDER_EMAIL=admin@yourdomain.com # Where admin notifications are sent
```

### Optional Variables:
```env
ADMIN_EMAIL=admin@yourdomain.com      # Fallback admin email
```

## 🧪 Testing Email Setup

### 1. Test Contact Form
1. Go to your site: `http://localhost:3000/contact`
2. Fill out the contact form
3. Submit
4. Check `ADMIN_ORDER_EMAIL` inbox for notification

### 2. Test Order Emails
1. Add products to cart
2. Complete checkout process
3. Customer should receive order confirmation
4. Admin should receive new order notification

### 3. Check Server Logs
Look for these log messages:
```
✅ Email sent: <message-id>
✅ Customer order email sent to: customer@email.com
✅ Admin order email sent to: admin@email.com
✅ Contact form email sent to: admin@email.com
```

If you see errors:
```
❌ Email sending failed: [error message]
⚠️ SMTP not configured. Emails will not be sent.
```

## 🔧 Troubleshooting

### Gmail "Less Secure Apps" Error
- **Solution**: Use App Password (see Option 1 above)
- Don't use your regular Gmail password
- Make sure 2-Step Verification is enabled first

### "Authentication Failed" Error
- Check SMTP_USER and SMTP_PASS are correct
- For Gmail, make sure you're using App Password
- For SendGrid, username must be exactly `apikey`

### "Connection Timeout" Error
- Check SMTP_HOST is correct
- Try different ports: 587 (TLS) or 465 (SSL)
- Check firewall isn't blocking SMTP ports

### "SMTP Not Configured" Warning
- Make sure all SMTP_ variables are set in `.env.local`
- Restart your development server after adding variables
- Check for typos in variable names

### Emails Going to Spam
- Use a professional domain email for EMAIL_FROM
- Configure SPF, DKIM, and DMARC records (for production)
- Use a reputable SMTP provider like SendGrid

## 📧 Email Templates

### Customer Order Confirmation Includes:
- Thank you message
- Order number and date
- Complete order summary with items
- Subtotal, shipping, tax, and total
- Shipping address
- Contact information

### Admin Order Notification Includes:
- New order alert
- Customer information and email
- Shipping address
- Detailed order items table
- Order totals
- Link to view order in admin panel

### Contact Form Notification Includes:
- Customer name and email
- Phone number (if provided)
- Subject line
- Full message
- Order number (if provided)

## 🎨 Customizing Email Templates

Email templates are located in:
```
src/lib/email-templates.ts
```

You can customize:
- Email styling (colors, fonts, layout)
- Logo and branding
- Email content and messaging
- Footer information

## 🚀 Production Deployment

### Recommended Setup:
1. Use professional email service (SendGrid, Mailgun, or Amazon SES)
2. Use your own domain for EMAIL_FROM (e.g., `orders@dayaura.com`)
3. Set up proper DNS records (SPF, DKIM, DMARC)
4. Enable email tracking and analytics
5. Monitor bounce rates and spam complaints

### Vercel Deployment:
Add environment variables in Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add all SMTP_ variables
3. Add EMAIL_FROM and ADMIN_ORDER_EMAIL
4. Redeploy your application

## 📊 Email Delivery Monitoring

### Check Email Logs:
- Look at server logs for email send confirmations
- Check SMTP provider dashboard for delivery status
- Monitor bounce and spam rates

### Test in Production:
1. Place a test order with real email
2. Submit a test contact form
3. Verify emails are received
4. Check spam folder if not in inbox

## 🔒 Security Best Practices

1. **Never commit `.env.local` to git**
2. **Use App Passwords** for Gmail (not regular password)
3. **Rotate SMTP credentials** periodically
4. **Use environment variables** for all sensitive data
5. **Enable TLS/SSL** (port 587 or 465)
6. **Monitor for unauthorized access** in SMTP provider logs

## 💡 Tips

- **Development**: Use Gmail with App Password
- **Production**: Use SendGrid or similar service
- **Testing**: Check spam folder if emails don't arrive
- **Debugging**: Enable detailed logging in SMTP provider
- **Performance**: Most SMTP services have rate limits
- **Reliability**: Use retry logic for failed emails

## 📞 Support

If you have issues:
1. Check error logs in server console
2. Verify all environment variables are set
3. Test SMTP credentials with email client
4. Contact your SMTP provider support
5. Review their documentation

## ✅ Setup Checklist

- [ ] SMTP provider account created
- [ ] SMTP credentials obtained
- [ ] Environment variables added to `.env.local`
- [ ] Development server restarted
- [ ] Contact form test completed
- [ ] Order email test completed
- [ ] Emails arriving in inbox (not spam)
- [ ] Admin notifications working
- [ ] Customer notifications working
- [ ] Production environment variables configured

## 🎯 Next Steps

1. Add your SMTP credentials to `.env.local`
2. Restart your development server
3. Test contact form submission
4. Place a test order
5. Verify emails are received
6. Deploy to production! 🚀
