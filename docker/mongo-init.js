// MongoDB initialization script
db = db.getSiblingDB('lalisure');

// Create application user
db.createUser({
  user: 'lalisure_user',
  pwd: 'lalisure_password',
  roles: [
    {
      role: 'readWrite',
      db: 'lalisure'
    }
  ]
});

// Create initial collections with indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ clerkId: 1 }, { unique: true });

db.policies.createIndex({ userId: 1 });
db.policies.createIndex({ policyNumber: 1 }, { unique: true });
db.policies.createIndex({ status: 1 });

db.claims.createIndex({ userId: 1 });
db.claims.createIndex({ policyId: 1 });
db.claims.createIndex({ claimNumber: 1 }, { unique: true });
db.claims.createIndex({ status: 1 });

print('Database initialized successfully');