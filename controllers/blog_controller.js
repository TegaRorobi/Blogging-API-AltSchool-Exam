
const Blog = require('../models/Blog');
const User = require('../models/User');
const mongoose = require('mongoose');

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
            let error = new Error(`Blog creation failed. Blog with title \'${title}\' already exists.`);
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
            message: 'Blog successfully created.',
            blog: {
                id: blog._id,
                title: blog.title,
                description: blog.description,
                body: blog.body,
                tags: blog.tags,
                state: blog.state,
                author: blog.author}
        });
    } catch (err) {
        next(err);
    }
};

const updateBlog = async (req, res, next) => {
    try {
        const {blog_id} = req.params;
        const author_id = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(blog_id)) { // to check that the blog ID passed as a request parameter is valid
            log('ERROR', `User ${req.user.email}: Blog update failed. Invalid Blog ID value (${blog_id})`);
            let error = new Error(`Blog update failed. Invalid Blog ID value "${blog_id}"`);
            error.status_coode = 400;
            next(error);
        };

        const valid_updates = ['title', 'description', 'body', 'tags', 'state'];
        const request_updates = Object.keys(req.body);

        update_is_valid = (updateitem) => valid_updates.includes(updateitem);
        const request_updates_are_valid = request_updates.every(update_is_valid);
        if (!request_updates_are_valid) {
            log('ERROR', `User ${req.user.email}: Blog update failed. Invalid update fields found in request: \n${req.body}`);
            let error = new Error(`Blog update failed. Invalid update fields. Valid fields are: ${valid_updates}`);
            error.status_coode = 400;
            next(error);
        };

        const blog = await Blog.findOne({_id:blog_id, author:author_id});
        if (!blog) { log('ERROR', `User ${req.user.email}: Blog update failed. Blog not found (${blog_id})`);
            let error = new Error(`Blog update failed. Blog of yours with ID \'${blog_id}\' not found.`);
            error.status_coode = 400;
            next(error);
        };

        valid_states = ['draft', 'published'];
        request_updates.forEach((update) => {
            if (update === 'state') {
                if (!valid_states.includes(req.body['state'])) {
                    log('ERROR', `User ${req.user.email}: Blog update failed. Invalid state \'${req.body['state']}\'`);
                    let error = new Error(`Blog update failed. Invalid state: \'${req.body['state']}\' Valid states are: ${valid_states}`);
                    error.status_coode = 400;
                    next(error);
                }
                blog.state = req.body['state'];
            } else {
                blog[update] = req.body[update];
            }
        });

        await blog.save();

        res.status(200).json({
            status: 'updated',
            message: 'Blog successfully updated.',
            blog: {
                id: blog._id,
                title: blog.title,
                description: blog.description,
                body: blog.body,
                tags: blog.tags,
                state: blog.state,
                author: blog.author}
        });
    } catch (err) {
        next(err);
    }

};
module.exports = {
    createBlog,
    updateBlog
};