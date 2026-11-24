import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BlogPostSummary } from "@/lib/blogShared";

/** Sidebar list of post titles with small arrow bullets (Blogs page and article pages). */
export default function BlogSidebarList({ title, posts, currentId }: { title: string; posts: BlogPostSummary[]; currentId?: string }) {
    return (
        <aside className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="inline-block border-b-2 border-primary pb-1.5 font-display text-2xl font-semibold text-ink">{title}</h2>
            <ul className="mt-6 max-h-[70vh] space-y-4 overflow-y-auto pr-2">
                {posts.map((p) => {
                    const current = p._id === currentId;
                    return (
                        <li key={p._id} className="flex gap-2.5">
                            <span className="mt-1.5 h-0 w-0 shrink-0 border-y-[5px] border-l-[6px] border-y-transparent border-l-primary" aria-hidden="true" />
                            <Link
                                href={`/blogs/${p.slug}`}
                                aria-current={current ? "page" : undefined}
                                className={cn(
                                    "font-display text-[17px] font-semibold leading-snug transition-colors hover:text-primary",
                                    current ? "text-primary" : "text-ink"
                                )}
                            >
                                {p.title}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </aside>
    );
}
