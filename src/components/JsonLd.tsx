interface OrganizationSchemaProps {
    name: string;
    description: string;
    url: string;
    logo?: string;
    sameAs?: string[];
    /** From Admin → Contact. */
    contact: { phone: string; email: string; hqName: string; hqAddress: string };
}

export function OrganizationSchema({ name, description, url, logo, sameAs, contact }: OrganizationSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": name,
        "description": description,
        "url": url,
        ...(logo && { "logo": logo }),
        ...(sameAs && sameAs.length > 0 && { "sameAs": sameAs }),
        "address": {
            "@type": "PostalAddress",
            "streetAddress": [contact.hqName, ...contact.hqAddress.split(/\r?\n/)].map((s) => s.trim()).filter(Boolean).join(", "),
            "addressCountry": "IN"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": contact.phone,
            "contactType": "customer service",
            "email": contact.email,
            "availableLanguage": ["English", "Hindi"]
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface CourseSchemaProps {
    name: string;
    description: string;
    provider: string;
    url: string;
    category?: string;
}

export function CourseSchema({ name, description, provider, url, category }: CourseSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": name,
        "description": description,
        "provider": {
            "@type": "EducationalOrganization",
            "name": provider,
            "sameAs": "https://learnink.edu.in"
        },
        "url": url,
        ...(category && { "courseCode": category }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface WebSiteSchemaProps {
    name: string;
    url: string;
}

export function WebSiteSchema({ name, url }: WebSiteSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": name,
        "url": url,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${url}/programs?search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
