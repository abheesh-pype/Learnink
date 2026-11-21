import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    eyebrow: string;
    title: React.ReactNode;
    lead?: React.ReactNode;
    align?: "center" | "left";
    className?: string;
    /** Heading level for the title (defaults to h2). */
    as?: "h1" | "h2";
}

/** Standard section heading: small label, title and optional intro text. */
export default function SectionHeader({ eyebrow, title, lead, align = "center", className, as: Heading = "h2" }: SectionHeaderProps) {
    return (
        <div className={cn(align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl", className)}>
            <span className="eyebrow">{eyebrow}</span>
            <Heading className="section-title">{title}</Heading>
            {lead && <p className="section-lead">{lead}</p>}
        </div>
    );
}
