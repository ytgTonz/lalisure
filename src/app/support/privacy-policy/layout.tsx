import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Lalisure Insurance",
  description: "Learn how Lalisure protects your personal information and complies with South African privacy laws including POPIA. Understand your privacy rights.",
  keywords: ["privacy policy", "POPIA compliance", "data protection", "personal information", "privacy rights", "South Africa privacy law"],
  openGraph: {
    title: "Privacy Policy | Lalisure Insurance",
    description: "Learn how Lalisure protects your personal information and complies with South African privacy laws including POPIA.",
    type: "website",
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}