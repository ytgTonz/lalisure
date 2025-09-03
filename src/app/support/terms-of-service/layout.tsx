import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Lalisure Insurance",
  description: "Read our terms and conditions governing the use of Lalisure insurance services, policies, and digital platform. Understand your rights and obligations.",
  keywords: ["terms of service", "terms and conditions", "insurance terms", "user agreement", "policy terms", "South Africa insurance law"],
  openGraph: {
    title: "Terms of Service | Lalisure Insurance",
    description: "Read our terms and conditions governing the use of Lalisure insurance services, policies, and digital platform.",
    type: "website",
  },
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}