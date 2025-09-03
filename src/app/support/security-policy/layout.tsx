import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security Policy | Lalisure Insurance",
  description: "Learn about Lalisure's comprehensive security measures, data protection practices, and how we keep your personal and financial information safe.",
  keywords: ["security policy", "data security", "cybersecurity", "information security", "data protection", "encryption", "fraud protection"],
  openGraph: {
    title: "Security Policy | Lalisure Insurance",
    description: "Learn about Lalisure's comprehensive security measures, data protection practices, and how we keep your information safe.",
    type: "website",
  },
};

export default function SecurityPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}