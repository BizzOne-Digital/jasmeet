import { connectDB } from "@/lib/mongodb";
import ContactSubmission from "@/models/ContactSubmission";
import { contactSchema } from "@/lib/validations/api";
import { jsonSuccess, handleRouteError } from "@/lib/api-response";
import { sendEmail } from "@/lib/email";
import { generateContactFormEmail } from "@/lib/email-templates";
import { getSiteSettings } from "@/lib/data/settings";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    await connectDB();
    const submission = await ContactSubmission.create(data);

    // Send email notification to admin
    try {
      const settings = await getSiteSettings();
      const adminEmail =
        process.env.ADMIN_ORDER_EMAIL ||
        settings.contactEmail ||
        process.env.ADMIN_EMAIL ||
        "";

      if (adminEmail) {
        const emailHtml = generateContactFormEmail({
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
          orderNumber: data.orderNumber,
        });

        await sendEmail({
          to: adminEmail,
          subject: `Contact Form: ${data.subject}`,
          html: emailHtml,
        });

        console.log(`✅ Contact form email sent to: ${adminEmail}`);
      } else {
        console.warn("⚠️ Admin email not configured, contact form email not sent");
      }
    } catch (emailError: unknown) {
      console.error("❌ Failed to send contact form email:", emailError instanceof Error ? emailError.message : String(emailError));
      // Don't fail the request if email fails
    }

    return jsonSuccess(submission, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
