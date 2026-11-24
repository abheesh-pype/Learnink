import { Metadata } from "next";
import { withPageUrl } from "@/lib/site";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHeader from "@/components/ui/PageHeader";
import SubHeading from "@/components/ui/SubHeading";
import BlogSidebarList from "@/components/BlogSidebarList";
import { LatestPostItem, PopularPostItem } from "@/components/BlogListItems";
import { getBlog } from "@/lib/publicData";

/**
 * Blogs page:
 *   Popular Posts (chosen in Admin → Blogs), 3 per row
 *   Latest News: every post, newest first   │  All Posts (titles)
 */
export default async function BlogsPage() {
    const { popular, all } = await getBlog();

    return (
        <main className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <PageHeader
                breadcrumbs={[{ label: "Blog" }]}
                eyebrow="Insights & News"
                title={<>Our <span className="italic text-primary">Blog</span></>}
                lead="Guides, stories and updates on universities, study options and building your career."
            />
            <div className="w-full flex-1">
                <section className="section">
                    <div className="container-page">
                        {all.length === 0 ? (
                            <div className="card px-8 py-16 text-center">
                                <h2 className="text-2xl font-bold text-ink">Articles Coming Soon</h2>
                                <p className="mt-2 text-slate-500">Check back soon for new posts.</p>
                            </div>
                        ) : (
                            <div className="space-y-14">
                                {/* Popular Posts */}
                                {popular.length > 0 && (
                                    <section aria-label="Popular Posts">
                                        <SubHeading as="h2">Popular Posts</SubHeading>
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
                                        <SubHeading as="h2">Latest News</SubHeading>
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
