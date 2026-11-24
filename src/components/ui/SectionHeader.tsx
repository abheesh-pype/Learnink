import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    eyebrow: string;
    title: React.ReactNode;
    lead?: React.ReactNode;
    /** Shown on the right of the heading on wide screens, e.g. a "View all" link or arrows. */
    action?: React.ReactNode;
    /** "left" (default, used across the site) or "center". */
    align?: "center" | "left";
    className?: string;
    /** Heading level for the title (defaults to h2). */
    as?: "h1" | "h2";
}

/** Standard section heading used on every page: small label, title, optional intro, optional action on the right. */
export default function SectionHeader({ eyebrow, title, lead, action, align = "left", className, as: Heading = "h2" }: SectionHeaderProps) {
    if (align === "center") {
        return (
            <div className={cn("mx-auto max-w-3xl text-center", className)}>
                <span className="eyebrow">{eyebrow}</span>
                <Heading className="section-title">{title}</Heading>
                {lead && <p className="section-lead">{lead}</p>}
                {action && <div className="mt-6 flex justify-center">{action}</div>}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10", className)}>
            <div className="max-w-2xl">
                <span className="eyebrow">{eyebrow}</span>
                <Heading className="section-title">{title}</Heading>
                {lead && <p className="section-lead">{lead}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
