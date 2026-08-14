import { formatPrice } from "@/lib/utils";

interface OrderItem {
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderDetails {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency?: string;
}

// Email styles
const emailStyles = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      background: #000000;
      color: #F5F0E6;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      letter-spacing: 0.3em;
      font-weight: 400;
    }
    .content {
      padding: 30px 20px;
    }
    .order-number {
      background: #f8f8f8;
      border-left: 4px solid #D4AF37;
      padding: 15px;
      margin: 20px 0;
      font-size: 16px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #000;
    }
    .order-item {
      border-bottom: 1px solid #e5e5e5;
      padding: 15px 0;
      display: table;
      width: 100%;
    }
    .order-item:last-child {
      border-bottom: none;
    }
    .item-image {
      display: table-cell;
      width: 80px;
      vertical-align: top;
    }
    .item-image img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
    }
    .item-details {
      display: table-cell;
      padding-left: 15px;
      vertical-align: top;
    }
    .item-name {
      font-weight: 600;
      margin-bottom: 5px;
      color: #000;
    }
    .item-meta {
      color: #666;
      font-size: 14px;
    }
    .totals {
      margin-top: 30px;
      border-top: 2px solid #e5e5e5;
      padding-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }
    .total-row.grand-total {
      font-size: 18px;
      font-weight: 600;
      border-top: 2px solid #000;
      padding-top: 15px;
      margin-top: 10px;
    }
    .address-box {
      background: #f8f8f8;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .footer {
      background: #000;
      color: #F5F0E6;
      text-align: center;
      padding: 20px;
      font-size: 14px;
    }
    .footer a {
      color: #D4AF37;
      text-decoration: none;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #D4AF37;
      color: #000;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
  </style>
`;

// Customer Order Confirmation Email
export function generateCustomerOrderEmail(order: OrderDetails): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <div class="order-item">
      ${
        item.image
          ? `<div class="item-image"><img src="${item.image}" alt="${item.name}" /></div>`
          : ""
      }
      <div class="item-details">
        <div class="item-name">${item.name}</div>
        <div class="item-meta">
          Size: ${item.size} | Color: ${item.color} | Quantity: ${item.quantity}
        </div>
        <div class="item-meta" style="margin-top: 5px;">
          ${formatPrice(item.price, order.currency)} × ${item.quantity} = ${formatPrice(item.price * item.quantity, order.currency)}
        </div>
      </div>
    </div>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - ${order.orderNumber}</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>DAYAURA</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; letter-spacing: 0.2em;">WEAR YOUR AURA</p>
        </div>
        
        <div class="content">
          <h2 style="color: #000; margin-top: 0;">Thank You for Your Order!</h2>
          <p>Hi ${order.customerName},</p>
          <p>We've received your order and we're getting it ready. You'll receive a shipping confirmation email with tracking information once your order ships.</p>
          
          <div class="order-number">
            <strong>Order Number:</strong> ${order.orderNumber}<br>
            <strong>Order Date:</strong> ${order.orderDate}
          </div>

          <h3 class="section-title">Order Summary</h3>
          <div class="order-items">
            ${itemsHtml}
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatPrice(order.subtotal, order.currency)}</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span>${formatPrice(order.shipping, order.currency)}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>${formatPrice(order.tax, order.currency)}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>${formatPrice(order.total, order.currency)}</span>
            </div>
          </div>

          <h3 class="section-title">Shipping Address</h3>
          <div class="address-box">
            ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}<br>
            ${order.shippingAddress.country}
          </div>

          <p style="margin-top: 30px;">If you have any questions about your order, please contact us at <a href="mailto:dayauraofficial@gmail.com" style="color: #D4AF37;">dayauraofficial@gmail.com</a></p>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} DAYAURA. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://dayaura.com"}">Visit our store</a> | 
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://dayaura.com"}/track-order">Track your order</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Admin Order Notification Email
export function generateAdminOrderEmail(order: OrderDetails): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${item.size}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${item.color}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatPrice(item.price, order.currency)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: right;">${formatPrice(item.price * item.quantity, order.currency)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - ${order.orderNumber}</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛍️ NEW ORDER RECEIVED</h1>
        </div>
        
        <div class="content">
          <div class="order-number">
            <strong>Order Number:</strong> ${order.orderNumber}<br>
            <strong>Order Date:</strong> ${order.orderDate}
          </div>

          <h3 class="section-title">Customer Information</h3>
          <div class="address-box">
            <strong>Name:</strong> ${order.customerName}<br>
            <strong>Email:</strong> <a href="mailto:${order.customerEmail}">${order.customerEmail}</a>
          </div>

          <h3 class="section-title">Shipping Address</h3>
          <div class="address-box">
            ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.postalCode}<br>
            ${order.shippingAddress.country}
          </div>

          <h3 class="section-title">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background: #f8f8f8;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #000;">Product</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #000;">Size</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #000;">Color</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #000;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #000;">Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #000;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${formatPrice(order.subtotal, order.currency)}</span>
            </div>
            <div class="total-row">
              <span>Shipping:</span>
              <span>${formatPrice(order.shipping, order.currency)}</span>
            </div>
            <div class="total-row">
              <span>Tax:</span>
              <span>${formatPrice(order.tax, order.currency)}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total:</span>
              <span>${formatPrice(order.total, order.currency)}</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin/orders/${order.orderNumber}" class="button">
              View Order in Admin
            </a>
          </div>
        </div>

        <div class="footer">
          <p>DAYAURA Admin Notification</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Contact Form Submission Email
export function generateContactFormEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  orderNumber?: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
      ${emailStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 NEW CONTACT FORM</h1>
        </div>
        
        <div class="content">
          <h2 style="color: #000; margin-top: 0;">Contact Form Submission</h2>
          
          <h3 class="section-title">Customer Details</h3>
          <div class="address-box">
            <strong>Name:</strong> ${data.name}<br>
            <strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a><br>
            ${data.phone ? `<strong>Phone:</strong> ${data.phone}<br>` : ""}
            ${data.orderNumber ? `<strong>Order Number:</strong> ${data.orderNumber}<br>` : ""}
          </div>

          <h3 class="section-title">Subject</h3>
          <p style="font-weight: 600; color: #000;">${data.subject}</p>

          <h3 class="section-title">Message</h3>
          <div class="address-box">
            ${data.message.replace(/\n/g, "<br>")}
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Reply to this customer at: <a href="mailto:${data.email}" style="color: #D4AF37;">${data.email}</a>
          </p>
        </div>

        <div class="footer">
          <p>DAYAURA Contact Form Notification</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
