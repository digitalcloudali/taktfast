import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/skolepanel", "/min-side", "/bekreftelse/", "/logg-inn"],
      },
    ],
    sitemap: "https://taktfast.no/sitemap.xml",
    host: "https://taktfast.no",
  };
}
