/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://imobweb.com',
    generateRobotsTxt: true,
    generateSitemap: true,
    sitemapSize: 5000,
    generateIndexSitemap: true,
    robotsTxtOptions: {
        additionalSitemaps: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://imobweb.com'}/sitemap.xml`],
        policies: [
            {
                userAgent: '*',
                allow: '/',
            },
        ],
    },
}