"use client";

import { Facebook, Link2, Linkedin, MessageCircle, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Social media buttons beside a blog article. Vertical column on desktop, a row on phones.
 *
 * The links are placeholders ("#") for now: add the real page / share addresses in `href` below later.
 * (`url` and `title` are the article's address and title, ready for share links.)
 */
const LINKS = [
    { label: "Facebook", href: "#", icon: Facebook, color: "bg-[#3b5998]" },
    { label: "X (Twitter)", href: "#", icon: Twitter, color: "bg-[#1d9bf0]" },
    { label: "LinkedIn", href: "#", icon: Linkedin, color: "bg-[#0a66c2]" },
    { label: "WhatsApp", href: "#", icon: MessageCircle, color: "bg-[#25d366]" },
    { label: "Link", href: "#", icon: Link2, color: "bg-slate-400" },
];

export default function ShareButtons(props: { url: string; title: string; className?: string }) {
    return (
        <div className={cn("flex gap-1 lg:flex-col", props.className)} aria-label="Social media">
            {LINKS.map(({ label, href, icon: Icon, color }) => (
                <a
                    key={label}
                    href={href}
                    // Placeholder links: don't jump to the top of the page when clicked.
                    onClick={href === "#" ? (e) => e.preventDefault() : undefined}
                    className={cn("flex h-10 w-10 items-center justify-center text-white transition-opacity hover:opacity-85", color)}
                    title={label}
                    aria-label={label}
                >
                    <Icon size={17} />
                </a>
            ))}
        </div>
    );
}
