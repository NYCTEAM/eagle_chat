require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Group = require('../models/Group');
const Message = require('../models/Message');
const Friend = require('../models/Friend');
const Bot = require('../models/Bot');
const Meeting = require('../models/Meeting');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

async function checkDatabase() {
  console.log('\n🔍 Starting Database Health Check...\n');

  if (!process.env.MONGODB_URI) {
    log(colors.red, '❌ Error: MONGODB_URI is not defined in .env');
    process.exit(1);
  }

  try {
    // 1. Connection Test
    log(colors.blue, '1️⃣  Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    log(colors.green, `✅ Connected to ${conn.connection.name} at ${conn.connection.host}`);

    // 2. Model & Collection Check
    log(colors.blue, '\n2️⃣  Verifying Models and Collections...');
    
    const models = [
      { name: 'User', model: User },
      { name: 'Group', model: Group },
      { name: 'Message', model: Message },
      { name: 'Friend', model: Friend },
      { name: 'Bot', model: Bot },
      { name: 'Meeting', model: Meeting }
    ];

    for (const { name, model } of models) {
      try {
        const count = await model.countDocuments();
        // Check if indexes are created
        await model.createIndexes(); 
        const indexes = await model.listIndexes();
        
        log(colors.green, `✅ ${name} Model: OK`);
        log(colors.cyan, `   - Documents: ${count}`);
        log(colors.cyan, `   - Indexes: ${indexes.length}`);
      } catch (err) {
        log(colors.red, `❌ ${name} Model Error: ${err.message}`);
      }
    }

    // 3. Functional Data Integrity Check
    log(colors.blue, '\n3️⃣  Checking Data Integrity...');

    // Check Users
    const users = await User.find().limit(5);
    if (users.length > 0) {
      log(colors.green, `✅ Users accessible. Sample addresses:`);
      users.forEach(u => console.log(`   - ${u.address} (${u.nickname || 'No Nickname'})`));
    } else {
      log(colors.yellow, '⚠️  No users found. System is empty but functional.');
    }

    // Check Groups
    const groups = await Group.find().limit(5);
    if (groups.length > 0) {
      log(colors.green, `✅ Groups accessible. Sample groups:`);
      groups.forEach(g => console.log(`   - ${g.name} (Members: ${g.members.length})`));
    } else {
      log(colors.yellow, '⚠️  No groups found.');
    }

    log(colors.green, '\n✨ Database Health Check Completed Successfully!\n');
    process.exit(0);

  } catch (error) {
    log(colors.red, `\n❌ Critical Error: ${error.message}`);
    process.exit(1);
  }
}

checkDatabase();
