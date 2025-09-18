#!/usr/bin/env node

/**
 * Migration script to add gender field to User model
 * Run this script after updating the Prisma schema
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Gender Field Migration');
console.log('=====================================');

try {
  // Step 1: Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Prisma client generated successfully');

  // Step 2: Run the migration script
  console.log('🔄 Running migration script...');
  execSync('npx tsx prisma/migrations/add-gender-to-user.ts', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ Migration script completed successfully');

  console.log('🎉 Gender field migration completed!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. The gender field has been added to the User model');
  console.log('2. Existing users will have null gender values');
  console.log('3. New users can set their gender during registration');
  console.log('4. The policy forms will now use user profile data');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
