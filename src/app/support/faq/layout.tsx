import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Lalisure Insurance",
  description: "Get answers to common questions about home insurance coverage, claims process, billing, and account management. Quick solutions to your insurance questions.",
  keywords: ["insurance FAQ", "home insurance questions", "claims FAQ", "billing questions", "Lalisure insurance help"],
  openGraph: {
    title: "FAQ | Lalisure Insurance",
    description: "Get answers to common questions about home insurance coverage, claims process, billing, and account management.",
    type: "website",
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}