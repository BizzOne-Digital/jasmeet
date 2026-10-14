/**
 * Reset SEO fields corrupted by spam/hack (e.g. PALU34 gambling titles).
 *
 * Usage: npx tsx scripts/fix-seo-spam.ts
 * Requires MONGODB_URI in the environment.
 */
import { connectDB } from "../src/lib/mongodb";
import SiteSettings from "../src/models/SiteSettings";
import Page from "../src/models/Page";
import { isSeoSpam } from "../src/lib/seo";

const DEFAULTS = {
  seoTitle: "DAYAURA | Wear Your Aura. Move with Confidence.",
  seoDescription:
    "Premium women's activewear combining style, comfort, and performance.",
};

async function main() {
  await connectDB();

  const settings = await SiteSettings.findOne();
  if (settings) {
    let changed = false;
    if (settings.seoTitle && isSeoSpam(settings.seoTitle)) {
      settings.seoTitle = DEFAULTS.seoTitle;
      changed = true;
      console.log("Reset SiteSettings.seoTitle");
    }
    if (settings.seoDescription && isSeoSpam(settings.seoDescription)) {
      settings.seoDescription = DEFAULTS.seoDescription;
      changed = true;
      console.log("Reset SiteSettings.seoDescription");
    }
    if (changed) await settings.save();
  }

  const home = await Page.findOne({ slug: "home" });
  if (home) {
    let changed = false;
    if (home.seoTitle && isSeoSpam(home.seoTitle)) {
      home.seoTitle = DEFAULTS.seoTitle;
      changed = true;
      console.log("Reset home Page.seoTitle");
    }
    if (home.seoDescription && isSeoSpam(home.seoDescription)) {
      home.seoDescription = DEFAULTS.seoDescription;
      changed = true;
      console.log("Reset home Page.seoDescription");
    }
    if (changed) await home.save();
  }

  console.log("SEO spam cleanup finished.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
