
const express = require('express');
const cors = require('cors');
const auth_controller = require('./controllers/auth_controller');
const connectDB = require('./mongodb_connect');

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`)
});