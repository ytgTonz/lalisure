import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Validate credentials format
const isValidAccountSid = accountSid && accountSid.startsWith('AC') && accountSid.length >= 34;
const isValidAuthToken = authToken && authToken.length >= 32;
const isValidPhoneNumber = fromNumber && fromNumber.startsWith('+');

if (!isValidAccountSid || !isValidAuthToken || !isValidPhoneNumber) {
  console.warn('Twilio credentials not properly configured. SMS functionality will be disabled.');
  console.warn(`AccountSid valid: ${!!isValidAccountSid}, AuthToken valid: ${!!isValidAuthToken}, Phone valid: ${!!isValidPhoneNumber}`);
}

const client = isValidAccountSid && isValidAuthToken ? twilio(accountSid, authToken) : null;

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class SmsService {
  /**
   * Send SMS message
   */
  static async sendSms(to: string, message: string): Promise<SmsResult> {
    if (!client || !isValidPhoneNumber) {
      console.warn('SMS service not configured or credentials invalid');
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      // Clean and validate phone number
      const cleanedNumber = this.cleanPhoneNumber(to);
      if (!this.isValidPhoneNumber(cleanedNumber)) {
        return { success: false, error: 'Invalid phone number format' };
      }

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: cleanedNumber,
      });

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send bulk SMS messages
   */
  static async sendBulkSms(
    recipients: Array<{ phone: string; message: string }>
  ): Promise<Array<{ phone: string; result: SmsResult }>> {
    const results = [];

    for (const recipient of recipients) {
      const result = await this.sendSms(recipient.phone, recipient.message);
      results.push({
        phone: recipient.phone,
        result,
      });

      // Add small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * Clean phone number format
   */
  private static cleanPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Add country code if missing (assuming US)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }

    // Add + prefix for international format
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Validate phone number format
   */
  private static isValidPhoneNumber(phone: string): boolean {
    // Basic validation for US phone numbers
    const phoneRegex = /^\+1[0-9]{10}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Get SMS delivery status
   */
  static async getMessageStatus(messageId: string): Promise<{
    status: string;
    errorCode?: string;
    errorMessage?: string;
  } | null> {
    if (!client) {
      return null;
    }

    try {
      const message = await client.messages(messageId).fetch();
      return {
        status: message.status,
        errorCode: message.errorCode || undefined,
        errorMessage: message.errorMessage || undefined,
      };
    } catch (error) {
      console.error('Failed to fetch message status:', error);
      return null;
    }
  }

  // Predefined SMS templates for common scenarios
  static async sendClaimUpdateSms(phone: string, claimNumber: string, status: string) {
    const message = `Home Insurance Alert: Claim ${claimNumber} status updated to ${status}. Check your account for details.`;
    return this.sendSms(phone, message);
  }

  static async sendPaymentReminderSms(phone: string, policyNumber: string, amount: number, dueDate: string) {
    const message = `Payment Reminder: R${amount} due for policy ${policyNumber} on ${dueDate}. Pay online to avoid late fees.`;
    return this.sendSms(phone, message);
  }

  static async sendPolicyExpirationSms(phone: string, policyNumber: string, expirationDate: string) {
    const message = `Policy Alert: Your policy ${policyNumber} expires on ${expirationDate}. Renew now to maintain coverage.`;
    return this.sendSms(phone, message);
  }

  static async sendEmergencyClaimSms(phone: string, claimNumber: string) {
    const message = `URGENT: Emergency claim ${claimNumber} received. Our team will contact you within 2 hours. Call us at 1-800-xxx-xxxx for immediate assistance.`;
    return this.sendSms(phone, message);
  }

  /**
   * Verify phone number format before storing
   */
  static validateAndFormatPhone(phone: string): { valid: boolean; formatted?: string; error?: string } {
    try {
      const cleaned = this.cleanPhoneNumber(phone);
      const valid = this.isValidPhoneNumber(cleaned);
      
      if (valid) {
        return { valid: true, formatted: cleaned };
      } else {
        return { valid: false, error: 'Invalid phone number format. Please use a US phone number.' };
      }
    } catch (error) {
      return { valid: false, error: 'Failed to process phone number.' };
    }
  }
}

export default SmsService;