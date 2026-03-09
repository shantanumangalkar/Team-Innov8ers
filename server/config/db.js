const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Atlas Connection Error: ${error.message}`);
        console.log('Falling back to In-Memory MongoDB for development...');

        try {
            const mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();

            const conn = await mongoose.connect(mongoUri);
            console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
            console.warn('WARNING: Data will not be persisted across server restarts.');
        } catch (memError) {
            console.error(`In-Memory MongoDB Error: ${memError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;
