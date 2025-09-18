import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addAgentSettings() {
  console.log('Adding agent settings fields to existing users...');

  try {
    // Update all users to have default agent preferences and working hours
    const result = await prisma.user.updateMany({
      where: {
        OR: [
          { agentPreferences: null },
          { workingHours: null }
        ]
      },
      data: {
        agentPreferences: {
          emailNotifications: true,
          smsNotifications: true,
          weeklyReports: true,
          autoFollowUp: false,
          timezone: 'Africa/Johannesburg',
          language: 'en'
        },
        workingHours: {
          monday: { enabled: true, start: '08:00', end: '17:00' },
          tuesday: { enabled: true, start: '08:00', end: '17:00' },
          wednesday: { enabled: true, start: '08:00', end: '17:00' },
          thursday: { enabled: true, start: '08:00', end: '17:00' },
          friday: { enabled: true, start: '08:00', end: '17:00' },
          saturday: { enabled: false, start: '09:00', end: '13:00' },
          sunday: { enabled: false, start: '09:00', end: '13:00' }
        }
      }
    });

    console.log(`Updated ${result.count} users with default agent settings`);

    // Generate agent codes for existing agents
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: { id: true, firstName: true, lastName: true, agentCode: true }
    });

    for (const agent of agents) {
      if (!agent.agentCode) {
        const agentCode = `AGT${agent.id.slice(-6).toUpperCase()}`;
        await prisma.user.update({
          where: { id: agent.id },
          data: { agentCode }
        });
        console.log(`Generated agent code ${agentCode} for ${agent.firstName} ${agent.lastName}`);
      }
    }

    console.log('Agent settings migration completed successfully!');
  } catch (error) {
    console.error('Error during agent settings migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
addAgentSettings()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
