import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lalisure - Insurance Platform",
  description: "Modern insurance platform for policies, claims, and customer management",
  icons: {
    icon: [
      { url: "/lalisure_house_icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/lalisure_house_icon.svg",
    apple: "/lalisure_house_icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA">
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
