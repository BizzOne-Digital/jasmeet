import nodemailer from "nodemailer";

// Create reusable transporter
export function createTransporter() {
  // Check if SMTP is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    console.warn("SMTP not configured. Emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("Email not sent (SMTP not configured):", { to, subject });
    return { success: false, message: "SMTP not configured" };
  }

  const emailFrom = process.env.EMAIL_FROM || process.env.SMTP_USER;

  try {
    const info = await transporter.sendMail({
      from: `"DAYAURA" <${emailFrom}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    });

    console.log("✅ Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    console.error("❌ Email sending failed:", error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
