require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Department = require('./models/Department');

const authRoutes = require('./routes/authRoutes');
const deptRoutes = require('./routes/deptRoutes');
const cohortRoutes = require('./routes/cohortRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

async function start() {
    await connectDB();

    // Auto seed if empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
        console.log('Auto-seeding...');
        const depts = await Department.insertMany([
            { name: 'Computer Science', description: 'Department of CS' },
            { name: 'Mechanical Engineering', description: 'Department of ME' },
            { name: 'Business Administration', description: 'Department of BA' }
        ]);

        await User.create({
            name: 'System Admin',
            email: 'admin@system.com',
            password: 'adminpassword',
            role: 'ADMIN'
        });

        await User.create({
            name: 'John Doe',
            email: 'john@cs.com',
            password: 'password123',
            role: 'DEPT_HEAD',
            department: depts[0]._id
        });

        await User.create({
            name: 'Jane Smith',
            email: 'jane@cs.com',
            password: 'password123',
            role: 'SUPERVISOR',
            department: depts[0]._id
        });
        console.log('Auto-seeding complete');
    }
}

start();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', deptRoutes);
app.use('/api/cohorts', cohortRoutes);
app.use('/api/attendance', attendanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
