import type { Metadata, Viewport } from "next";
import { Cinzel, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { champion, contacts } from "@/lib/data";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = "https://djaduls.dev";

const title = "DJADULS | Khairul Baharuddin — Full-Stack Software Engineer";
const description =
  "Khairul Baharuddin (DJADULS) — Full-Stack Software Engineer specializing in Next.js, React, Node.js, and cloud infrastructure. Backend, Frontend, Mobile & DevOps abilities forged in the Rift.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: title,
    template: "%s | DJADULS",
  },
  description,
  keywords: [
    "Khairul Baharuddin",
    "DJADULS",
    "Software Engineer",
    "Full-Stack Developer",
    "Next.js Developer",
    "React Developer",
    "Backend Engineer",
    "Portfolio",
  ],
  authors: [{ name: champion.name, url: SITE_URL }],
  creator: champion.name,
  publisher: champion.name,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: SITE_URL,
    siteName: "DJADULS Portfolio",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#010a13",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: champion.name,
  alternateName: champion.alias,
  jobTitle: champion.role,
  description,
  url: SITE_URL,
  sameAs: contacts
    .filter((c) => c.href.startsWith("http"))
    .map((c) => c.href),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#010a13] text-[#cdbe91] font-mono">
        {children}
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
