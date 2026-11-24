import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/ui/PageHeader";
import Footer from "@/components/Footer";
import ShareButtons from "@/components/ShareButtons";
import BlogEnquiryForm from "@/components/BlogEnquiryForm";
import BlogSidebarList from "@/components/BlogSidebarList";
import { SITE_URL, withPageUrl } from "@/lib/site";
import { getBlog, getBlogPost } from "@/lib/publicData";
import { getContactInfo } from "@/lib/contactSettings";
import { formatBlogDate, parseBlogContent, type BlogPostSummary } from "@/lib/blogShared";
import { cn } from "@/lib/utils";

/**
 * One blog post:
 *   title + by-line ─────────────────────────────────────
 *   cover image                          │ Most Popular
 *   share │ article text                │  ▸ every post
 *   enquiry form, WhatsApp line          │
 *   previous post │ next post            │
 */
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [post, blog, contact] = await Promise.all([getBlogPost(slug), getBlog(), getContactInfo()]);
    if (!post) notFound();

    const section = blog.sections.find((s) => s._id === post.sectionId);
    const blocks = parseBlogContent(post.content);
    const url = `${SITE_URL}/blogs/${post.slug}`;

    // `all` is newest first: the previous post is the next older one, the next post the next newer one.
    const index = blog.all.findIndex((p) => p._id === post._id);
    const previous = index >= 0 ? blog.all[index + 1] : undefined;
    const next = index > 0 ? blog.all[index - 1] : undefined;

    // Sidebar: featured posts first, then the rest (newest first).
    const popular = [...blog.all.filter((p) => p.featured), ...blog.all.filter((p) => !p.featured)];

    const whatsappNumber = contact.phone.replace(/\D/g, "");

    return (
        <main className="flex min-h-screen flex-col bg-white">
            <Navbar />
            {/* Title + by-line in the shared page header */}
            <PageHeader breadcrumbs={[{ label: "Blog", href: "/blogs" }, { label: post.title }]} title={post.title}>
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                        <span>
                            by <span className="font-semibold text-primary">Learnink</span>
                        </span>
                        <span aria-hidden="true">—</span>
                        <time dateTime={post.publishedAt}>{formatBlogDate(post.publishedAt)}</time>
                        {(post.tag || section) && (
                            <span>
                                in <span className="font-semibold text-slate-700">{post.tag || section?.title}</span>
                            </span>
                        )}
                    </p>
            </PageHeader>
            <article className="section w-full flex-1">
                <div className="container-page">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
                        {/* Main column */}
                        <div className="min-w-0">
                            {post.coverImage && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={post.coverImage} alt="" referrerPolicy="no-referrer" className="aspect-[2/1] w-full bg-primary-100 object-cover" />
                            )}

                            <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:gap-10">
                                <ShareButtons url={url} title={post.title} className="lg:sticky lg:top-28 lg:self-start" />
                                <div className="min-w-0 flex-1 space-y-6 text-[17px] leading-[1.8] text-slate-600">
                                    {post.excerpt && <p className="text-lg font-medium text-slate-700">{post.excerpt}</p>}
                                    {blocks.length === 0 && !post.excerpt && <p className="text-slate-500">This article has no text yet.</p>}
                                    {blocks.map((block, i) =>
                                        block.type === "h2" ? (
                                            <h2 key={i} className="pt-4 font-display text-3xl font-bold text-ink">{block.text}</h2>
                                        ) : block.type === "ul" ? (
                                            <ul key={i} className="list-disc space-y-2 pl-6">
                                                {block.items.map((item, j) => <li key={j}>{item}</li>)}
                                            </ul>
                                        ) : (
                                            <p key={i}>{block.text}</p>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Enquiry form + WhatsApp */}
                            <div className="mt-12">
                                <BlogEnquiryForm postTitle={post.title} />
                                {whatsappNumber && (
                                    <p className="mt-6 text-center text-lg font-semibold text-ink">
                                        Contact us on WhatsApp{" "}
                                        <a
                                            href={`https://wa.me/${whatsappNumber}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                                        >
                                            <MessageCircle size={18} /> {contact.phone}
                                        </a>
                                    </p>
                                )}
                            </div>

                            {/* Previous / next */}
                            {(previous || next) && (
                                <nav className="mt-12 grid grid-cols-1 border-t border-slate-200 pt-8 sm:grid-cols-2" aria-label="More articles">
                                    <PostNavLink post={previous} label="Previous Post" className="sm:border-r sm:border-slate-200 sm:pr-6" />
                                    <PostNavLink post={next} label="Next Post" className="mt-6 sm:mt-0 sm:pl-6" />
                                </nav>
                            )}
                        </div>

                        {/* Sidebar: every post (popular ones first) */}
                        <BlogSidebarList title="Most Popular" posts={popular} currentId={post._id} />
                    </div>
                </div>
            </article>
            <Footer />
        </main>
    );
}

function PostNavLink({ post, label, className }: { post?: BlogPostSummary; label: string; className?: string }) {
    if (!post) return <div className={className} />;
    return (
        <Link href={`/blogs/${post.slug}`} className={cn("group block text-center", className)}>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</span>
            <span className="mt-2 block font-display text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-primary">{post.title}</span>
        </Link>
    );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogPost(slug);
    if (!post) return { title: "Article not found" };
    return withPageUrl(
        {
            title: post.title,
            description: post.excerpt || post.content.slice(0, 160),
            openGraph: {
                title: post.title,
                description: post.excerpt || undefined,
                type: "article",
                images: post.coverImage ? [{ url: post.coverImage }] : undefined,
            },
        },
        `/blogs/${post.slug}`
    );
}
