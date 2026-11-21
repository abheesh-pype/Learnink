"use client";

import { SessionProvider } from "next-auth/react";
import { MotionConfig } from "framer-motion";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            {/* Animations follow the visitor's "reduce motion" system setting */}
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </SessionProvider>
    );
}
