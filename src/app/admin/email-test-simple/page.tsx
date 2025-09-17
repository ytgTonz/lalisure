import { EmailTestSimple } from '@/components/admin/email-test-simple';

export default function EmailTestSimplePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Email Test - Simple</h1>
        <p className="text-gray-600 mt-2">
          Test your Resend email configuration without complex setup
        </p>
      </div>
      
      <EmailTestSimple />
    </div>
  );
}
