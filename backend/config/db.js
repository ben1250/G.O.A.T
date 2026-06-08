const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully');
    } else {
        // Fallback to memory server if no URI provided
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log(`MongoDB Memory Server connected at ${uri}`);
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const closeDB = async () => {
    await mongoose.connection.close();
    if (mongod) {
        await mongod.stop();
    }
};

module.exports = { connectDB, closeDB };
