import { Partner } from "@/lib/models";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, GraduationCap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dbConnect from "@/lib/db";

interface Props {
    params: Promise<{ slug: string }>;
}

interface ProgramItem {
    _id: string;
    title: string;
    description: string;
    category: string;
    slug: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    await dbConnect();
    const { slug } = await params;
    const partner = await Partner.findOne({ slug }).lean();

    if (!partner) return {};

    return {
        title: `${partner.name} | Learnink University Partner`,
        description: partner.description || `Learn about ${partner.name} and the programs they offer through Learnink Education.`,
        alternates: { canonical: `/partners/${slug}` },
    };
}

export default async function PartnerDetailPage({ params }: Props) {
    await dbConnect();
    const { slug } = await params;

    // Populate programs to show the list
    const partner = await Partner.findOne({ slug }).populate('programs').lean();

    if (!partner) notFound();

    return (
        <main className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <PageHeader
                breadcrumbs={[{ label: "Universities", href: "/partners" }, { label: partner.name }]}
                eyebrow="University Partner"
                title={partner.name}
            >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
                    {partner.logo && (
                        <span className="flex h-14 w-14 items-center justify-center rounded-md border border-slate-200 bg-white p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={partner.logo} alt={partner.name} className="h-full w-full object-contain" />
                        </span>
                    )}
                    <span className="inline-flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-primary" />
                        Verified Partner
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <GraduationCap size={16} className="text-primary" />
                        {partner.programs?.length || 0} Programs Offered
                    </span>
                </div>
            </PageHeader>

            <div className="section flex-1">
                <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-12">
                    {/* Main Content: Description & Programs */}
                    <div className="space-y-8 lg:col-span-8">
                        {/* University Description */}
                        <section className="card p-6 sm:p-8">
                            <h2 className="font-display text-3xl font-semibold text-ink">About the University</h2>
                            <div className="prose mt-4 max-w-none leading-relaxed text-slate-600">
                                {partner.description || "Information about this prestigious partner will be updated shortly."}
                            </div>
                        </section>

                        {/* Programs Offered */}
                        <section>
                            <h2 className="font-display text-3xl font-semibold text-ink">
                                Available Programs at {partner.name}
                            </h2>

                            <div className="mt-5 grid grid-cols-1 gap-4">
                                {partner.programs?.length > 0 ? (
                                    partner.programs.map((program: ProgramItem) => (
                                        <div key={program._id} className="card card-hover group flex flex-col justify-between gap-5 p-6 md:flex-row md:items-center">
                                            <div className="flex-1">
                                                <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                    {program.category}
                                                </span>
                                                <h3 className="mt-3 text-lg font-bold text-ink transition-colors group-hover:text-primary">{program.title}</h3>
                                                <p className="mt-1 text-sm text-slate-500 line-clamp-1">{program.description}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Link href={`/programs/${program.slug}`} className="btn-outline px-5 py-2.5">
                                                    Details
                                                </Link>
                                                <Link href="/contact" className="btn-primary px-5 py-2.5">
                                                    Enroll Now
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-lg border border-dashed border-primary-200 bg-white p-12 text-center text-slate-500">
                                        No programs currently listed.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="bg-brand-gradient sticky top-28 overflow-hidden rounded-lg p-6 text-white shadow-sm sm:p-8">
                            <p className="font-display text-2xl font-semibold">Want to study at {partner.name}?</p>
                            <p className="mt-2 text-sm text-white/80">Our counsellors will help you choose the right program.</p>
                            <div className="mt-6 space-y-3">
                                {partner.enrollLink && (
                                    <a
                                        href={partner.enrollLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-light w-full"
                                    >
                                        Direct Enrollment <ExternalLink size={16} />
                                    </a>
                                )}
                                <Link
                                    href="/contact"
                                    className="inline-flex w-full items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                                >
                                    Talk to a Counsellor
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            <Footer />
        </main>
    );
}
