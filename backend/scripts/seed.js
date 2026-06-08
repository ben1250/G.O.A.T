require('dotenv').config();
const { connectDB, closeDB } = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');

const seed = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});

    // Create Departments
    const depts = await Department.insertMany([
      { name: 'Computer Science', description: 'Department of CS' },
      { name: 'Mechanical Engineering', description: 'Department of ME' },
      { name: 'Business Administration', description: 'Department of BA' }
    ]);

    // Create Admin
    await User.create({
      name: 'System Admin',
      email: 'admin@system.com',
      password: 'adminpassword',
      role: 'ADMIN'
    });

    // Create a Dept Head for CS
    await User.create({
        name: 'John Doe',
        email: 'john@cs.com',
        password: 'password123',
        role: 'DEPT_HEAD',
        department: depts[0]._id
    });

    // Create a Supervisor for CS
    await User.create({
        name: 'Jane Smith',
        email: 'jane@cs.com',
        password: 'password123',
        role: 'SUPERVISOR',
        department: depts[0]._id
    });

    console.log('Database seeded successfully');
    await closeDB();
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
