import { cache } from "react";
import { unstable_cache } from "next/cache";

/**
 * Performance-driven Caching Layer for imobWeb
 * Implements React 'cache' for per-request deduplication 
 * and Next.js 'unstable_cache' for cross-request/ISR caching.
 */

/**
 * Deduped version of a function that fetches property details.
 * Useful inside Server Components to avoid redundant DB calls in the same request.
 */
export const getPropertyDeduped = cache(async (id: string) => {
  // Mock call - replace with prisma logic
  console.log(`[Cache] Fetching property ${id} from DB`);
  return { id, title: "Imóvel Otimizado", updatedAt: new Date() };
});

/**
 * ISR-optimized version of a function that fetches property listings.
 * Cached across users and revalidated every hour.
 */
export const getPropertyListingCached = (organizationId: string) => {
  return unstable_cache(
    async () => {
      console.log(`[ISR] Fetching listing for ${organizationId}`);
      // Simulate heavy DB query
      return [];
    },
    [`properties-list-${organizationId}`],
    {
      revalidate: 3600, // 1 hour
      tags: ["properties"],
    }
  );
};

/**
 * Cache Purge Utility
 */
export const purgePropertyCache = (id: string) => {
  // Logic to revalidatePath or revalidateTag
};
