
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // read environment variables from .env

const connectDB = async () => {
    try {
	await mongoose.connect(process.env.MONGO_URI, {});
	console.log('MongoDB connection succeeded.');

    } catch (err) {
	console.error(`MongoDB connection error: ${err.message}`);
	process.exit(1);
    };
};

module.exports = connectDB;
