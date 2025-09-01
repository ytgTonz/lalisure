import { db } from '@/lib/db';
import PaystackService from './services/paystack';

export async function seedNotifications(userId: string) {
  try {
    // Create some sample notifications
    const notifications = [
      {
        userId,
        type: 'WELCOME',
        title: 'Welcome to Lalisure',
        message: 'Thank you for joining our home insurance platform. Your account is now active.',
        read: false,
        data: { source: 'seed' },
      },
      {
        userId,
        type: 'POLICY_CREATED',
        title: 'Policy Created Successfully',
        message: 'Your home insurance policy has been created and is now active.',
        read: false,
        data: { policyNumber: 'POL-123456', source: 'seed' },
      },
      {
        userId,
        type: 'PAYMENT_DUE',
        title: 'Payment Reminder',
        message: `Your premium payment of ${PaystackService.formatCurrency(12500)} is due in 5 days.`,
        read: true,
        data: { amount: 125.00, dueDate: '2025-09-01', source: 'seed' },
      },
      {
        userId,
        type: 'GENERAL',
        title: 'System Notification',
        message: 'We have updated our terms of service. Please review the changes.',
        read: false,
        data: { source: 'seed' },
      },
    ];

    // Insert notifications
    for (const notification of notifications) {
      await db.notification.create({
        data: notification,
      });
    }

    console.log(`✅ Seeded ${notifications.length} notifications for user ${userId}`);
    return notifications.length;
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    throw error;
  }
}

// Helper function to seed notifications for all users
export async function seedNotificationsForAllUsers() {
  try {
    const users = await db.user.findMany({
      select: { id: true, email: true },
    });

    let totalSeeded = 0;
    for (const user of users) {
      const count = await seedNotifications(user.id);
      totalSeeded += count;
    }

    console.log(`✅ Total notifications seeded: ${totalSeeded} for ${users.length} users`);
    return totalSeeded;
  } catch (error) {
    console.error('❌ Error seeding notifications for all users:', error);
    throw error;
  }
}