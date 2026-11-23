// Server-side only.
import { revalidatePath } from "next/cache";

/**
 * Public pages are cached on the server so they load instantly (see `revalidate` in app/layout.tsx).
 * Call this after the admin changes anything the website shows, so visitors see the change right away.
 */
export function refreshPublicPages() {
    revalidatePath("/", "layout");
    revalidatePath("/robots.txt");
    revalidatePath("/sitemap.xml");
}
