require('dotenv').config();
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');

async function test() {
  try {
    await connectDB();
    console.log('Connected for testing');

    const dept = await Department.create({ name: 'IT Department', description: 'Tech stuff' });
    const user = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'ADMIN',
      department: dept._id
    });

    console.log('User created:', user.name);
    console.log('Department created:', dept.name);

    await closeDB();
    console.log('Test complete and connection closed');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

test();
