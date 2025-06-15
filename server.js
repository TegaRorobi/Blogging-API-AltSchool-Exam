
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./mongodb_connect');

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}.`)
});