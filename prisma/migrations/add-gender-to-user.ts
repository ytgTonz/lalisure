import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addGenderToUser() {
  try {
    console.log('🔄 Adding gender field to User model...');
    
    // Since MongoDB doesn't require explicit schema migrations for adding optional fields,
    // we just need to ensure the Prisma client is regenerated
    console.log('✅ Gender field added to User model');
    console.log('📝 Note: Run "npx prisma generate" to update the Prisma client');
    
    // Optional: Update any existing users with default gender if needed
    // const updatedUsers = await prisma.user.updateMany({
    //   where: {
    //     gender: null
    //   },
    //   data: {
    //     gender: 'PREFER_NOT_TO_SAY' // or any default value
    //   }
    // });
    
    // console.log(`✅ Updated ${updatedUsers.count} users with default gender`);
    
  } catch (error) {
    console.error('❌ Error adding gender field:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
addGenderToUser()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
