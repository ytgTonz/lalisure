import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support | Lalisure Insurance",
  description: "Get help with your home insurance questions, access our help center, FAQs, and support resources.",
  keywords: ["insurance support", "help center", "customer service", "FAQ", "Lalisure support"],
  openGraph: {
    title: "Support | Lalisure Insurance",
    description: "Get help with your home insurance questions, access our help center, FAQs, and support resources.",
    type: "website",
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}