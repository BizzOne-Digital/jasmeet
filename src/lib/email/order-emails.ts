import nodemailer from "nodemailer";
import { absoluteUrl, formatPrice } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  SHIPPING_METHOD_LABELS,
  type OrderStatus,
  type ShippingMethod,
} from "@/lib/order-status";

export interface OrderEmailItem {
  name: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  isPreOrder?: boolean;
  preOrderLeadTime?: string;
}

export interface OrderShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface OrderEmailPayload {
  orderNumber: string;
  orderStatus: OrderStatus;
  shippingMethod: ShippingMethod;
  items: OrderEmailItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  courierName?: string;
  trackingNumber?: string;
  hasPreOrderItems?: boolean;
  shippingAddress?: OrderShippingAddress;
  notes?: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function trackOrderUrl(orderNumber: string, email: string) {
  const params = new URLSearchParams({
    orderNumber,
    email,
  });
  return absoluteUrl(`/track-order?${params.toString()}`);
}

function trackOrderCta(orderNumber: string, email: string) {
  const href = trackOrderUrl(orderNumber, email);
  return `
    <div style="margin:28px 0 8px;">
      <a href="${href}"
         style="display:inline-block;background:#D4AF37;color:#050505;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;padding:14px 22px;font-weight:700;">
        Track your order
      </a>
    </div>
    <p style="font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:rgba(245,240,230,0.45);">
      Or open: <a href="${href}" style="color:#D4AF37;">${href}</a>
    </p>`;
}

function wrapHtml(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#050505;color:#F5F0E6;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="letter-spacing:0.28em;text-transform:uppercase;color:#D4AF37;font-size:11px;font-family:Arial,sans-serif;">DAYAURA</p>
    <h1 style="font-weight:400;font-size:28px;letter-spacing:0.04em;margin:16px 0 24px;">${title}</h1>
    ${body}
    <p style="margin-top:40px;font-size:12px;color:rgba(245,240,230,0.45);font-family:Arial,sans-serif;">
      Wear Your Aura. Move with Confidence.<br/>
      <a href="${absoluteUrl()}" style="color:#D4AF37;">dayaura.com</a>
    </p>
  </div>
</body></html>`;
}

function itemsHtml(items: OrderEmailItem[], currency: string) {
  return `
  <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
    ${items
      .map(
        (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid rgba(245,240,230,0.12);">
          <strong>${escapeHtml(item.name)}</strong><br/>
          <span style="color:rgba(245,240,230,0.55);">
            ${escapeHtml(item.color)} · ${escapeHtml(item.size)} · Qty ${item.quantity}
            ${
              item.isPreOrder
                ? `<br/><em style="color:#D4AF37;">Pre-order${
                    item.preOrderLeadTime
                      ? ` — ${escapeHtml(item.preOrderLeadTime)}`
                      : ""
                  }</em>`
                : ""
            }
          </span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid rgba(245,240,230,0.12);text-align:right;">
          ${formatPrice(item.price * item.quantity, currency)}
        </td>
      </tr>`
      )
      .join("")}
  </table>`;
}

function totalsHtml(payload: OrderEmailPayload, currency: string) {
  return `
    <p style="font-family:Arial,sans-serif;margin-top:20px;line-height:1.7;color:rgba(245,240,230,0.7);">
      Subtotal: ${formatPrice(payload.subtotal, currency)}<br/>
      Shipping: ${payload.shipping === 0 ? "Free" : formatPrice(payload.shipping, currency)}<br/>
      <strong style="color:#F5F0E6;">Total: ${formatPrice(payload.total, currency)}</strong>
    </p>`;
}

export function buildOrderStatusEmail(payload: OrderEmailPayload): {
  subject: string;
  html: string;
} {
  const currency = payload.currency || "CAD";
  const label = ORDER_STATUS_LABELS[payload.orderStatus];
  const shippingLabel = SHIPPING_METHOD_LABELS[payload.shippingMethod];
  const name = escapeHtml(payload.customerName);
  const orderNo = escapeHtml(payload.orderNumber);

  let intro = "";
  let title = label;

  switch (payload.orderStatus) {
    case "order_received":
      title = "Thank you for your order";
      intro = `<p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">Hi ${name}, thank you for shopping with DAYAURA. We've received your order <strong style="color:#F5F0E6;">${orderNo}</strong> and will begin preparing it shortly.</p>
      <p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">You can track your order anytime — status updates such as received, processing, packed, shipped / dispatched, and delivered will appear on the Track Order page.</p>`;
      if (payload.hasPreOrderItems) {
        intro += `<p style="font-family:Arial,sans-serif;line-height:1.6;color:#D4AF37;">This order includes <strong>pre-order</strong> item(s). Estimated processing times are listed under each pre-order line below.</p>`;
      }
      break;
    case "processing":
      intro = `<p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">Hi ${name}, your order <strong style="color:#F5F0E6;">${orderNo}</strong> is now being processed.</p>`;
      break;
    case "packed":
      intro = `<p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">Hi ${name}, your order <strong style="color:#F5F0E6;">${orderNo}</strong> is packed and ready for dispatch.</p>`;
      break;
    case "shipped":
      intro = `<p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">Great news — order <strong style="color:#F5F0E6;">${orderNo}</strong> has been dispatched with the courier.</p>`;
      if (payload.courierName || payload.trackingNumber) {
        intro += `<p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">
          ${payload.courierName ? `<strong>Courier:</strong> ${escapeHtml(payload.courierName)}<br/>` : ""}
          ${payload.trackingNumber ? `<strong>Tracking:</strong> ${escapeHtml(payload.trackingNumber)}` : ""}
        </p>`;
      }
      break;
    case "out_for_local_delivery":
      intro = `<p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">Your order <strong style="color:#F5F0E6;">${orderNo}</strong> is out for local delivery. No courier tracking number is required for local deliveries.</p>`;
      break;
    case "delivered":
      intro = `<p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">Your order <strong style="color:#F5F0E6;">${orderNo}</strong> has been delivered. We hope you love wearing your aura.</p>`;
      break;
    case "cancelled":
      intro = `<p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">Your order <strong style="color:#F5F0E6;">${orderNo}</strong> has been cancelled. If you have questions, reply to this email.</p>`;
      break;
    case "refunded":
      intro = `<p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">A refund has been issued for order <strong style="color:#F5F0E6;">${orderNo}</strong>. Please allow a few business days for it to appear.</p>`;
      break;
    default:
      intro = `<p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">Update for order <strong style="color:#F5F0E6;">${orderNo}</strong>: ${label}.</p>`;
  }

  const showTrackCta = ![
    "cancelled",
    "refunded",
    "delivered",
  ].includes(payload.orderStatus);

  const body = `
    ${intro}
    ${showTrackCta ? trackOrderCta(payload.orderNumber, payload.customerEmail) : ""}
    <p style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,230,0.45);margin-top:28px;">Shipping · ${shippingLabel}</p>
    ${itemsHtml(payload.items, currency)}
    ${totalsHtml(payload, currency)}
  `;

  const subject =
    payload.orderStatus === "order_received"
      ? `DAYAURA · Thanks for your order · ${payload.orderNumber}`
      : `DAYAURA · ${label} · ${payload.orderNumber}`;

  return {
    subject,
    html: wrapHtml(title, body),
  };
}

export function buildAdminNewOrderEmail(payload: OrderEmailPayload): {
  subject: string;
  html: string;
} {
  const currency = payload.currency || "CAD";
  const addr = payload.shippingAddress;
  const shippingLabel = SHIPPING_METHOD_LABELS[payload.shippingMethod];

  const contactBlock = addr
    ? `
    <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:rgba(245,240,230,0.8);margin:16px 0 24px;">
      <p style="margin:0 0 8px;letter-spacing:0.14em;text-transform:uppercase;font-size:11px;color:#D4AF37;">Customer</p>
      <strong style="color:#F5F0E6;">${escapeHtml(addr.firstName)} ${escapeHtml(addr.lastName)}</strong><br/>
      Email: <a href="mailto:${escapeHtml(addr.email)}" style="color:#D4AF37;">${escapeHtml(addr.email)}</a><br/>
      Phone: <a href="tel:${escapeHtml(addr.phone)}" style="color:#D4AF37;">${escapeHtml(addr.phone)}</a>
    </div>
    <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:rgba(245,240,230,0.8);margin:0 0 24px;">
      <p style="margin:0 0 8px;letter-spacing:0.14em;text-transform:uppercase;font-size:11px;color:#D4AF37;">Ship to</p>
      ${escapeHtml(addr.address)}<br/>
      ${escapeHtml(addr.city)}, ${escapeHtml(addr.province)} ${escapeHtml(addr.postalCode)}<br/>
      ${escapeHtml(addr.country)}
    </div>`
    : `
    <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:rgba(245,240,230,0.8);margin:16px 0 24px;">
      <strong style="color:#F5F0E6;">${escapeHtml(payload.customerName)}</strong><br/>
      <a href="mailto:${escapeHtml(payload.customerEmail)}" style="color:#D4AF37;">${escapeHtml(payload.customerEmail)}</a>
    </div>`;

  const notesBlock = payload.notes
    ? `<p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:rgba(245,240,230,0.7);"><strong>Notes:</strong> ${escapeHtml(payload.notes)}</p>`
    : "";

  const adminOrderUrl = absoluteUrl(`/admin/orders`);

  const body = `
    <p style="font-family:Arial,sans-serif;line-height:1.6;color:rgba(245,240,230,0.75);">
      A new order <strong style="color:#F5F0E6;">${escapeHtml(payload.orderNumber)}</strong> was placed on the store.
      ${payload.hasPreOrderItems ? `<br/><span style="color:#D4AF37;">Includes pre-order item(s).</span>` : ""}
    </p>
    ${contactBlock}
    <p style="font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(245,240,230,0.45);">
      Shipping · ${shippingLabel}
    </p>
    ${itemsHtml(payload.items, currency)}
    ${totalsHtml(payload, currency)}
    ${notesBlock}
    <div style="margin-top:28px;">
      <a href="${adminOrderUrl}"
         style="display:inline-block;background:#D4AF37;color:#050505;text-decoration:none;font-family:Arial,sans-serif;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;padding:14px 22px;font-weight:700;">
        Open orders in admin
      </a>
    </div>
  `;

  return {
    subject: `DAYAURA · New order ${payload.orderNumber}`,
    html: wrapHtml("New order received", body),
  };
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; mode: string }> {
  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    "DAYAURA <noreply@dayaura.com>";

  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[email:resend]", text);
      throw new Error("Failed to send email via Resend");
    }
    return { sent: true, mode: "resend" };
  }

  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return { sent: true, mode: "smtp" };
  }

  console.info("[email:dev]", {
    to: options.to,
    subject: options.subject,
    preview: options.html.slice(0, 240),
  });
  return { sent: false, mode: "log" };
}

export async function sendOrderStatusEmail(payload: OrderEmailPayload) {
  const { subject, html } = buildOrderStatusEmail(payload);
  return sendEmail({ to: payload.customerEmail, subject, html });
}

export async function sendAdminNewOrderEmail(
  payload: OrderEmailPayload,
  adminEmail: string
) {
  if (!adminEmail?.trim()) {
    console.warn("[email] No admin email configured for new-order alerts");
    return { sent: false, mode: "skipped" };
  }
  const { subject, html } = buildAdminNewOrderEmail(payload);
  return sendEmail({ to: adminEmail.trim(), subject, html });
}
