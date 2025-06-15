
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // read environment variables from .env

const log = (level, message) => console.log(`[${new Date().toISOString()}] [DB_CONNECT] ${level}: ${message}`);

const connectDB = async () => {
    try {
	await mongoose.connect(process.env.MONGO_URI, {});
	log('INFO', 'MongoDB connection succeeded.');

    } catch (err) {
	log('ERROR', `MongoDB connection error: ${err.message}`);
	process.exit(1);
    };
};

module.exports = connectDB;
