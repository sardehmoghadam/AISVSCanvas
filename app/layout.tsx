import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@/components/analytics";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_URL, absoluteUrl, buildOpenGraph } from "@/lib/site-config";
import { websiteJsonLd } from "@/lib/structured-data";
import { standard } from "@/config/standard";

const description = standard.description;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: standard.academyName,
    template: `%s | ${standard.academyName}`,
  },
  description,
  applicationName: standard.academyName,
  keywords: standard.keywords,
  creator: standard.academyName,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  // Search-engine site-verification tokens are injected here at build time from
  // env vars (see .github/workflows/deploy.yml). null omits the tag entirely.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || null,
  },
  openGraph: buildOpenGraph({
    title: standard.academyName,
    description,
    url: absoluteUrl("/"),
  }),
  twitter: {
    card: "summary_large_image",
    title: standard.academyName,
    description,
    images: [absoluteUrl("/opengraph-image.png")],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased text-foreground">
        <JsonLd data={websiteJsonLd} />
        <Analytics />
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}