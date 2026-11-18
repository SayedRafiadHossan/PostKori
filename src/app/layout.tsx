import type { Metadata, Viewport } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

// Hind Siliguri supports both Bangla and English characters
const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

const title = "PostKori — ছবি দিন, পোস্ট নিন";
const description =
  "Free AI tool for Bangladeshi Facebook sellers: upload a product photo and get a caption, description, hashtags and price post in Bangla and English.";

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL to your live URL after deploying (Step 5)
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title,
  description,
  keywords: ["f-commerce", "Facebook caption generator", "Bangla AI", "online shop Bangladesh", "PostKori"],
  authors: [{ name: "Sayed Rafiad Hossan", url: "https://www.linkedin.com/in/rafiadhossan" }],
  openGraph: {
    title,
    description,
    siteName: "PostKori",
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#2f6bff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={hind.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
