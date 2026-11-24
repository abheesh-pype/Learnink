import { Metadata } from "next";
import { withPageUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/ui/SectionHeader";
import BlogSidebarList from "@/components/BlogSidebarList";
import { LatestPostItem, PopularPostItem } from "@/components/BlogListItems";
import { getBlog } from "@/lib/publicData";

/** Heading with a short coloured underline, e.g. "Popular Posts". */
function BlogHeading({ children }: { children: React.ReactNode }) {
    return <h2 className="inline-block border-b-2 border-primary pb-1.5 font-display text-3xl font-semibold text-ink">{children}</h2>;
}

/**
 * Blogs page:
 *   Popular Posts (chosen in Admin → Blogs), 3 per row
 *   Latest News: every post, newest first   │  All Posts (titles)
 */
export default async function BlogsPage() {
    const { popular, all } = await getBlog();

    return (
        <main className="flex min-h-screen flex-col bg-white pt-20">
            <Navbar />
            <div className="w-full flex-1">
                <section className="section">
                    <div className="container-page">
                        <SectionHeader
                            as="h1"
                            eyebrow="Insights & News"
                            title={<>Our <span className="italic text-primary">Blog</span></>}
                            lead="Guides, stories and updates on universities, study options and building your career."
                        />

                        {all.length === 0 ? (
                            <div className="card mt-12 px-8 py-16 text-center lg:mt-16">
                                <h2 className="text-2xl font-bold text-ink">Articles Coming Soon</h2>
                                <p className="mt-2 text-slate-500">Check back soon for new posts.</p>
                            </div>
                        ) : (
                            <div className="mt-12 space-y-16 lg:mt-16">
                                {/* Popular Posts */}
                                {popular.length > 0 && (
                                    <section aria-label="Popular Posts">
                                        <BlogHeading>Popular Posts</BlogHeading>
                                        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {popular.map((post) => (
                                                <PopularPostItem key={post._id} post={post} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Latest News + all posts */}
                                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
                                    <section aria-label="Latest News">
                                        <BlogHeading>Latest News</BlogHeading>
                                        <div className="mt-6 space-y-8">
                                            {all.map((post) => (
                                                <LatestPostItem key={post._id} post={post} />
                                            ))}
                                        </div>
                                    </section>
                                    <BlogSidebarList title="All Posts" posts={all} />
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
        </main>
    );
}

export async function generateMetadata(): Promise<Metadata> {
    return withPageUrl(
        {
            title: "Blog",
            description: "Guides, stories and updates from Learnink on universities, study options and careers.",
        },
        "/blogs"
    );
}
