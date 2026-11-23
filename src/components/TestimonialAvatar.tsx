"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TestimonialAvatarProps {
    name: string;
    imageUrl?: string | null;
    className?: string;
}

/**
 * Profile picture for a testimonial. Falls back to the person's initial when
 * there is no image or the image fails to load (e.g. a removed link).
 */
export default function TestimonialAvatar({ name, imageUrl, className }: TestimonialAvatarProps) {
    const [failed, setFailed] = useState(false);
    const box = cn("w-14 h-14 shrink-0 rounded-full", className);

    if (imageUrl && !failed) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={imageUrl}
                alt={name}
                referrerPolicy="no-referrer"
                onError={() => setFailed(true)}
                className={cn(box, "object-cover")}
            />
        );
    }

    return (
        <div className={cn(box, "bg-primary-100 flex items-center justify-center text-primary font-display font-semibold text-xl uppercase")}>
            {name.trim().charAt(0) || "?"}
        </div>
    );
}
