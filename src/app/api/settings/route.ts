import { connectDB } from "@/lib/mongodb";
import { auth, requireAdmin } from "@/lib/auth";
import SiteSettings from "@/models/SiteSettings";
import { siteSettingsUpdateSchema } from "@/lib/validations/api";
import { revalidatePublicPaths } from "@/lib/revalidate";
import { jsonSuccess, handleRouteError } from "@/lib/api-response";

const publicSettingsFields = [
  "businessName",
  "logo",
  "favicon",
  "contactEmail",
  "phone",
  "address",
  "website",
  "businessHours",
  "supportHours",
  "responseTime",
  "instagramUrl",
  "tiktokUrl",
  "facebookUrl",
  "announcementMessages",
  "shippingThreshold",
  "standardShippingRate",
  "shippingProcessingTime",
  "shippingDeliveryEstimate",
  "localDeliveryEnabled",
  "localDeliveryFee",
  "localDeliveryPostalCodes",
  "firstOrderDiscountText",
  "footerDescription",
  "currency",
] as const;

export async function GET() {
  try {
    await connectDB();
    const settings =
      (await SiteSettings.findOne().lean()) ??
      (await SiteSettings.create({})).toObject();

    const session = await auth();
    if (session?.user) {
      return jsonSuccess(settings);
    }

    const publicSettings = Object.fromEntries(
      publicSettingsFields.map((field) => [field, settings[field]])
    );

    return jsonSuccess(publicSettings);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const data = siteSettingsUpdateSchema.parse(body);

    await connectDB();
    const settings = await SiteSettings.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      runValidators: true,
    });

    revalidatePublicPaths();
    return jsonSuccess(settings);
  } catch (error) {
    return handleRouteError(error);
  }
}
