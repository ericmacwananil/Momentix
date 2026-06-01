// Remove test users by email pattern
require('dotenv').config();
const mongoose = require('mongoose');

// NOTE: This script is safe to run multiple times and targets two test emails.
async function main(){
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const emails = ['testuser123@example.com','testuser456@example.com'];
  const result = await db.collection('users').deleteMany({ email: { $in: emails } });
  console.log('deletedCount:', result.deletedCount);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
