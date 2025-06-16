
const Blog = require('../models/Blog');
const User = require('../models/User');

const log = (level, message) => console.log(`[${new Date().toISOString()}] [BLOG_CONTROLLER] ${level}: ${message}`);

const createBlog = async (req, res, next) => {
    try {
        const {title, description, body, tags} = req.body;
        author_id = req.user.id;

        if (!title || !body) {
            log('ERROR', 'Blog creation attempt failed. Title and/or body not found.');
            let error = new Error('Blog creation failed. Please provide at least a Title and Body.');
            error.status_code = 400;
            return next(error);
        };

        const existing_blog = await Blog.findOne({title});
        if (existing_blog) {
            log('ERROR', 'Blog creation attempt failed. Title was not unique.')
            let error = new Error(`Blog creation failed. Blog with title ${title} already exists.`);
            error.status_code = 400;
            return next(error);
        };

        const blog = new Blog({
            title,
            description,
            body,
            tags,
            state: 'draft',
            author: author_id
        });

        await blog.save();
        log('INFO', `Blog successfully created by user - ${req.user.email}: ${title}`);

        res.status(201).json({
            status: 'created',
            message: 'Blog successfully created.'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createBlog
};