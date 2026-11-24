import { cn } from "@/lib/utils";

/**
 * Heading for a group inside a section (a gallery collection, "Popular Posts", "Latest News", a sidebar box).
 * Same look everywhere: serif title, optional note on the right, thin rule underneath.
 */
export default function SubHeading({
    children, meta, as: Heading = "h3", id, className,
}: {
    children: React.ReactNode;
    meta?: React.ReactNode;
    as?: "h2" | "h3";
    id?: string;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b border-primary-200 pb-3", className)}>
            <Heading id={id} className="font-display text-2xl font-semibold text-ink sm:text-[1.75rem]">
                {children}
            </Heading>
            {meta && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{meta}</p>}
        </div>
    );
}
