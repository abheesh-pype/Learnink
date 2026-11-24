import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: React.ReactNode;
    /** Small label above the title, e.g. a category. */
    eyebrow?: React.ReactNode;
    lead?: React.ReactNode;
    /** "Home" is added automatically; pass the rest, e.g. [{ label: "Programs", href: "/programs" }, { label: "MBA" }]. */
    breadcrumbs?: Crumb[];
    /** Extra content under the title (meta line, logo, buttons). */
    children?: React.ReactNode;
    className?: string;
}

/**
 * Top of every inner page (About, Programs, Gallery, Blog, Contact, policies, detail pages).
 * Light band that starts right under the floating navbar: breadcrumbs, title, intro, left-aligned.
 */
export default function PageHeader({ title, eyebrow, lead, breadcrumbs = [], children, className }: PageHeaderProps) {
    const crumbs: Crumb[] = [{ label: "Home", href: "/" }, ...breadcrumbs];

    return (
        <header className={cn("border-b border-primary-200/70 bg-primary-50", className)}>
            <div className="container-page pb-10 pt-28 sm:pt-32 lg:pb-12">
                <nav aria-label="Breadcrumb">
                    <ol className="flex flex-wrap items-center gap-1 text-xs font-medium text-slate-500">
                        {crumbs.map((crumb, i) => {
                            const last = i === crumbs.length - 1;
                            return (
                                <li key={i} className="flex items-center gap-1">
                                    {crumb.href && !last ? (
                                        <Link href={crumb.href} className="transition-colors hover:text-primary">
                                            {crumb.label}
                                        </Link>
                                    ) : (
                                        <span aria-current={last ? "page" : undefined} className={cn(last && "text-slate-700", "line-clamp-1")}>
                                            {crumb.label}
                                        </span>
                                    )}
                                    {!last && <ChevronRight size={12} className="text-slate-400" aria-hidden="true" />}
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}
                <h1 className={cn("max-w-4xl font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl", eyebrow ? "mt-3" : "mt-6")}>
                    {title}
                </h1>
                {lead && <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{lead}</p>}
                {children && <div className="mt-6">{children}</div>}
            </div>
        </header>
    );
}
