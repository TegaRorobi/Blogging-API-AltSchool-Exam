
const express = require('express');
const cors = require('cors');
const auth_controller = require('./controllers/auth_controller');
const blog_controller = require('./controllers/blog_controller');
const authenticateToken = require('./middleware/auth_middleware');
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
    res.status(200).json({status: 200, message: 'API running...', help: 'View API Documentation at apidog.com/...'})
});

app.post('/api/auth/signup', auth_controller.signup);
app.post('/api/auth/login', auth_controller.login);

app.post('/api/blog/create', authenticateToken, blog_controller.createBlog);
app.get('/api/blog/retrieve/:blog_id', blog_controller.retrieveBlog);
app.put('/api/blog/update/:blog_id', authenticateToken, blog_controller.updateBlog);
app.delete('/api/blog/delete/:blog_id', authenticateToken, blog_controller.deleteBlog);
app.get('/api/blog/retrieveall', blog_controller.retrievePublishedBlogs);


app.use(errorHandler); // global error handler

app.listen(PORT, () => {
    log('INFO', `Server running on port ${PORT}.`);
});