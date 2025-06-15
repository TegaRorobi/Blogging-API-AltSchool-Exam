
const express = require('express');
const cors = require('cors');
const auth_controller = require('./controllers/auth_controller');
const connectDB = require('./mongodb_connect');
const errorHandler = require('./middleware/error_handler');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const log = (level, message) => console.log(`[${new Date().toISOString()}] [SERVER] ${level}: ${message}`);

connectDB();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type']
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).json({status: 200, message: 'API running...'})
});

app.post('/api/auth/signup', auth_controller.signup);

app.use(errorHandler); // global error handler

app.listen(PORT, () => {
    log('INFO', `Server running on port ${PORT}.`);
});