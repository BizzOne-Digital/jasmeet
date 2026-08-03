import { connectDB } from "@/lib/mongodb";
import ContactSubmission from "@/models/ContactSubmission";
import { contactSchema } from "@/lib/validations/api";
import { jsonSuccess, handleRouteError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    await connectDB();
    const submission = await ContactSubmission.create(data);

    return jsonSuccess(submission, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
