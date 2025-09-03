import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center | Lalisure Insurance",
  description: "Find answers to common questions, browse help articles, and get the support you need for your home insurance. Search our comprehensive knowledge base.",
  keywords: ["help center", "insurance help", "customer support", "FAQs", "home insurance guide", "Lalisure support"],
  openGraph: {
    title: "Help Center | Lalisure Insurance",
    description: "Find answers to common questions, browse help articles, and get the support you need for your home insurance.",
    type: "website",
  },
};

export default function HelpCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}