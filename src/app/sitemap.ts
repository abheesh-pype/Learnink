import { MetadataRoute } from 'next';
import { BlogPost, Program } from '@/lib/models';
import dbConnect from '@/lib/db';
import { SITE_URL } from '@/lib/site';

// Refreshed when programs or universities change (lib/revalidate.ts), or every 5 minutes.
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_URL;

    // Static routes with differentiated priorities
    const staticRoutes = [
        { route: '', priority: 1.0, changeFrequency: 'daily' as const },
        { route: '/programs', priority: 0.9, changeFrequency: 'daily' as const },
        { route: '/about', priority: 0.7, changeFrequency: 'weekly' as const },
        { route: '/partners', priority: 0.7, changeFrequency: 'weekly' as const },
        { route: '/gallery', priority: 0.6, changeFrequency: 'weekly' as const },
        { route: '/blogs', priority: 0.7, changeFrequency: 'weekly' as const },
        { route: '/contact', priority: 0.8, changeFrequency: 'weekly' as const },
        { route: '/privacy', priority: 0.3, changeFrequency: 'monthly' as const },
        { route: '/terms', priority: 0.3, changeFrequency: 'monthly' as const },
    ].map((item) => ({
        url: `${baseUrl}${item.route}`,
        lastModified: new Date(),
        changeFrequency: item.changeFrequency,
        priority: item.priority,
    }));

    try {
        await dbConnect();
        const programs = await Program.find({}).select('slug updatedAt').lean();

        const programRoutes = programs
            .filter(program => program.slug) // Only include programs with slugs
            .map((program) => ({
                url: `${baseUrl}/programs/${program.slug}`,
                lastModified: new Date(program.updatedAt),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }));

        // Published blog posts
        const posts = await BlogPost.find({ published: true }).select('slug updatedAt').lean();
        const blogRoutes = posts.map((post) => ({
            url: `${baseUrl}/blogs/${post.slug}`,
            lastModified: new Date(post.updatedAt),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));

        return [...staticRoutes, ...programRoutes, ...blogRoutes];
    } catch (error) {
        console.error("Failed to generate sitemap", error);
        return staticRoutes;
    }
}
