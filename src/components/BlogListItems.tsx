import Link from "next/link";
import { Clock, FileText } from "lucide-react";
import { formatBlogDate, type BlogPostSummary } from "@/lib/blogShared";

function Thumb({ post, className }: { post: BlogPostSummary; className: string }) {
    return (
        <div className={`shrink-0 overflow-hidden bg-primary-100 ${className}`}>
            {post.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={post.coverImage}
                    alt=""
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-primary-200">
                    <FileText size={28} strokeWidth={1.25} />
                </div>
            )}
        </div>
    );
}

function PostDate({ date }: { date: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <Clock size={12} className="text-primary" />
            <time dateTime={date}>{formatBlogDate(date)}</time>
        </span>
    );
}

/** "Popular Posts": small thumbnail on the left, title and date on the right. */
export function PopularPostItem({ post }: { post: BlogPostSummary }) {
    return (
        <article className="group relative flex gap-4">
            <Thumb post={post} className="h-[68px] w-[96px]" />
            <div className="min-w-0">
                <h3 className="font-display text-[17px] font-bold leading-snug text-ink transition-colors group-hover:text-primary">
                    <Link href={`/blogs/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
                        {post.title}
                    </Link>
                </h3>
                <p className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    <PostDate date={post.publishedAt} />
                </p>
            </div>
        </article>
    );
}

/** "Latest News": larger image on the left, title, by-line, date and the first lines of the article. */
export function LatestPostItem({ post }: { post: BlogPostSummary }) {
    return (
        <article className="group relative flex flex-col gap-5 sm:flex-row">
            <Thumb post={post} className="aspect-[7/5] w-full sm:w-[220px]" />
            <div className="min-w-0">
                <h3 className="font-display text-2xl font-bold leading-snug text-ink transition-colors group-hover:text-primary">
                    <Link href={`/blogs/${post.slug}`} className="after:absolute after:inset-0 after:content-['']">
                        {post.title}
                    </Link>
                </h3>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    <span>
                        By <span className="font-semibold text-primary">Learnink</span>
                    </span>
                    <PostDate date={post.publishedAt} />
                </p>
                {post.snippet && <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{post.snippet}</p>}
            </div>
        </article>
    );
}
