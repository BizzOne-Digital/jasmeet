import { redirect } from "next/navigation";

/** Public gallery is paused until real campaign content is ready. */
export default function GalleryPage() {
  redirect("/");
}
