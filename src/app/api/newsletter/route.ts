import { connectDB } from "@/lib/mongodb";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";
import { newsletterSchema } from "@/lib/validations/api";
import { jsonSuccess, jsonError, handleRouteError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = newsletterSchema.parse(body);
    const normalizedEmail = email.toLowerCase();

    await connectDB();

    const existing = await NewsletterSubscriber.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.isActive) {
        return jsonError("This email is already subscribed", 409);
      }
      existing.isActive = true;
      existing.subscribedAt = new Date();
      await existing.save();
      return jsonSuccess(existing);
    }

    const subscriber = await NewsletterSubscriber.create({ email: normalizedEmail });
    return jsonSuccess(subscriber, 201);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return jsonError("This email is already subscribed", 409);
    }
    return handleRouteError(error);
  }
}
