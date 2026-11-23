"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOGO } from "@/lib/site";

export interface SocialLinks {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
}

/** Site-wide settings from Admin → SEO Settings, loaded once on the server in the root layout. */
export interface PublicSiteConfig {
    logo: string;
    /** Hero Background image uploaded in the admin panel; empty when none is set. */
    heroBg: string;
    socialLinks: SocialLinks;
}

const SiteConfigContext = createContext<PublicSiteConfig>({ logo: DEFAULT_LOGO, heroBg: "", socialLinks: {} });

export default function SiteConfigProvider({ value, children }: { value: PublicSiteConfig; children: React.ReactNode }) {
    return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
    return useContext(SiteConfigContext);
}
