import type { Metadata, Viewport } from "next";
import { Nunito, Figtree } from "next/font/google";
import { SessionProviders } from "@/components/auth/session-providers";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://taktfast.no";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Taktfast – Finn, sammenlign og book dansekurs i hele Norge",
    template: "%s | Taktfast",
  },
  description:
    "Finn dansekurs i hele Norge: salsa, bachata, swing, tango, brudevals, barnedans, hiphop, ballett og mer. Transparente priser, ledige plasser og verifiserte danseskoler. Book enkelt på minutter.",
  keywords: [
    "dansekurs", "danseskoler", "salsa kurs", "bachata nybegynner", "brudevals kurs",
    "bryllupsdans", "barnedans", "hiphop kurs barn", "swing kurs", "dansekurs Oslo",
    "dansekurs for voksne", "danse alene uten partner", "sosialdans", "dansekvelder",
  ],
  authors: [{ name: "Taktfast" }],
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: SITE_URL,
    siteName: "Taktfast",
    title: "Taktfast – Finn dansekurset som får deg i takt",
    description:
      "Norges uavhengige markedsplass for dansekurs: sammenlign priser, se ledige plasser og book hos verifiserte danseskoler.",
    images: [{ url: "/images/og-image.png", width: 1440, height: 720, alt: "Taktfast – dansekurs i hele Norge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Taktfast – Finn dansekurset som får deg i takt",
    description: "Finn, sammenlign og book dansekurs hos verifiserte danseskoler i hele Norge.",
    images: ["/images/og-image.png"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#00205B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nb-NO" suppressHydrationWarning>
      <body className={`${nunito.variable} ${figtree.variable} antialiased bg-background text-foreground flex min-h-screen flex-col`}>
        <SessionProviders>
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white focus:text-navy focus:px-4 focus:py-2">
            Hopp til innhold
          </a>
          <SiteHeader />
          <main id="main-content" className="flex-1 flex flex-col">{children}</main>
          <SiteFooter />
          <Toaster />
        </SessionProviders>
      </body>
    </html>
  );
}
