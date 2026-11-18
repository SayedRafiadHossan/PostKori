import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";

// Hind Siliguri supports both Bangla and English characters
const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PostKori — ছবি দিন, পোস্ট নিন",
  description:
    "AI tool for Facebook sellers: upload a product photo and get a description, caption, hashtags and price post in Bangla and English.",
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
