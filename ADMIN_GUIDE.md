# Admin Portal Guide

## 🎯 Access Admin Portal

**URL:** `http://localhost:3000/admin` (or `https://yourdomain.com/admin`)

**Default Login:**
- Email: Set in `ADMIN_EMAIL` env variable
- Password: Set in `ADMIN_PASSWORD` env variable

## 📦 Managing Orders

### View All Orders
1. Go to **Admin Portal** → **Orders**
2. You'll see a list of all orders with:
   - Order number
   - Customer name and email
   - Total amount
   - Payment method
   - Order status
   - Order date

### Search & Filter Orders
- **Search Box**: Search by order number, customer email, or name
- **Status Filter**: Filter by order status (All, Processing, Shipped, etc.)
- **Pre-order Checkbox**: Show only pre-orders

### View Order Details
1. Click on any order row
2. You'll see complete details:
   - **Customer Information**: Name, email, phone, shipping address
   - **Order Items**: Products, sizes, colors, quantities, prices
   - **Order Totals**: Subtotal, shipping, total
   - **Payment Status**: Paid/Pending/Failed
   - **Fulfillment Status**: Current order status

### Update Order Status
1. Open order details page
2. Select new status from **Order Status** dropdown:
   - Order Received
   - Processing
   - Shipped
   - Out for Local Delivery
   - Delivered
   - Cancelled
   - Refunded

3. Fill in shipping details (if shipping):
   - **Courier Name**: Canada Post, UPS, Purolator, etc.
   - **Tracking Number**: Required for shipped orders

4. Add **Internal Notes** (optional)
5. Click **"Save & notify customer"**

**Customer will receive email** when status changes to:
- Processing
- Shipped (with tracking info)
- Out for Local Delivery
- Delivered
- Cancelled
- Refunded

### Cancel an Order
1. Open order details
2. Click **"Cancel order"** button
3. Customer will be notified via email

## 📧 Order Email Notifications

### When Order is Placed:
1. **Customer receives**:
   - Order confirmation email
   - Order number
   - Complete order details
   - Shipping address
   - Order total

2. **Admin receives**:
   - New order notification
   - Customer information
   - Order details
   - Link to view in admin portal

### When Order Status Changes:
- Customer automatically receives email for:
  - Processing
  - Shipped (with tracking)
  - Delivered
  - Cancelled

## 🛍️ Order Information Display

### Orders List Shows:
- ✅ Order Number
- ✅ Customer Name & Email
- ✅ Total Amount
- ✅ Payment Method
- ✅ Order Status
- ✅ Order Date
- ✅ Pre-order Badge (if applicable)

### Order Details Shows:
- ✅ Customer full information
- ✅ Shipping address
- ✅ Phone number
- ✅ All order items with details
- ✅ Size, color, quantity for each item
- ✅ Individual and total prices
- ✅ Subtotal, shipping, total
- ✅ Payment status
- ✅ Order status
- ✅ Pre-order items highlighted
- ✅ Internal notes field

## 💳 Payment Information

### Payment Status:
- **Pending**: Payment not yet completed
- **Paid**: Successfully paid via Stripe
- **Failed**: Payment failed
- **Test**: Test order (when Stripe not configured)

### View Payment Details:
- Payment method shown on orders list
- Payment status shown on order details
- Stripe payment intent ID (in database)

## 📱 Contact Form Submissions

When customers submit contact form:
1. **Admin receives email** with:
   - Customer name and email
   - Subject
   - Message
   - Order number (if provided)
   - Phone (if provided)

2. **Also saved** in database under Contact Submissions

## 🔍 Order Search Features

### Search by:
- Order number (e.g., "ORD-2024-0001")
- Customer email
- Customer first name
- Customer last name

### Filter by:
- Order status (All, Processing, Shipped, etc.)
- Pre-order items only

## 📊 Order Statuses Explained

| Status | Description |
|--------|-------------|
| **Order Received** | New order just placed |
| **Processing** | Order is being prepared |
| **Shipped** | Order shipped with tracking |
| **Out for Local Delivery** | Local delivery in progress |
| **Delivered** | Order delivered to customer |
| **Cancelled** | Order cancelled |
| **Refunded** | Payment refunded |

## ✨ Admin Portal Features

### Currently Available:
✅ Orders Management
✅ Products Management
✅ Collections Management
✅ Pages Management
✅ Gallery Management
✅ FAQs Management
✅ Settings Management

### Orders Features:
✅ View all orders
✅ Search orders
✅ Filter by status
✅ Filter pre-orders
✅ View order details
✅ Update order status
✅ Add tracking information
✅ Add internal notes
✅ Cancel orders
✅ Email notifications
✅ Click to view details

## 🎯 Common Tasks

### Process a New Order:
1. Check admin email for new order notification
2. Go to Admin → Orders
3. Click on the order
4. Verify items and shipping address
5. Change status to "Processing"
6. Prepare items for shipping
7. Update status to "Shipped"
8. Add courier and tracking number
9. Click "Save & notify customer"

### Handle Pre-Orders:
1. Pre-order items shown with badge
2. Filter "Pre-order only" to see all pre-orders
3. When items arrive, process normally
4. Update status as usual

### Cancel an Order:
1. Open order details
2. Click "Cancel order"
3. Or select "Cancelled" status and save
4. Customer receives cancellation email

### View Customer Information:
1. Open any order
2. Customer section shows:
   - Full name
   - Email address
   - Phone number
   - Complete shipping address
   - Shipping method

## 🚀 Tips & Best Practices

1. **Check Orders Daily**: New orders appear immediately
2. **Update Status Promptly**: Customers receive email notifications
3. **Add Tracking Numbers**: Required for shipped orders
4. **Use Internal Notes**: Track fulfillment issues or special requests
5. **Search is Fast**: Quickly find orders by number or customer
6. **Click Rows**: Fastest way to view order details
7. **Email Notifications**: Automatically sent on status changes

## 📞 Customer Communication

### Automated Emails:
- Order confirmation (automatic)
- Order status updates (when you update status)
- Shipping confirmation with tracking (when you mark as shipped)

### Manual Communication:
- Reply to customer emails directly
- Customer email shown on order details
- Click email to open in your mail client

## ✅ Checklist for Order Fulfillment

- [ ] Receive order notification email
- [ ] View order in admin portal
- [ ] Verify all items are in stock
- [ ] Update status to "Processing"
- [ ] Pack items
- [ ] Create shipping label
- [ ] Update status to "Shipped"
- [ ] Add courier name and tracking number
- [ ] Save to notify customer
- [ ] Mark as delivered when confirmed

## 🔒 Security

- Admin area requires authentication
- Only authorized admins can access
- Session-based security
- Secure password handling
- Environment-based credentials

---

**Need Help?**
- Check order email notifications
- Review customer shipping address
- Update order status regularly
- Use search to find specific orders
- Contact support if issues arise
