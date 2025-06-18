
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
            blog
        });
    } catch (err) {
        next(err);
    }
};

const retrieveBlog = async (req, res, next) => {
    try {
        const {blog_id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(blog_id)) { // to check that the blog ID passed as a request parameter is valid
            log('ERROR', `User ${req.user? req.user.email : 'undefined'}: Blog retrieve failed. Invalid Blog ID value (${blog_id})`);
            let error = new Error(`Blog retrieve failed. Invalid Blog ID value "${blog_id}"`);
            error.status_code = 400;
            next(error);
        };

        const blog = await Blog.findOneAndUpdate(
            {_id:blog_id, state:'published'}, // should be only able to retrieve published blogs
            {$inc: {read_count: 1}}, // every time the blog is retrieved, I'll assume it's read and update the read coun
            {new: true}
        ).populate('author', 'first_name last_name email');
        if (!blog) {
            log('ERROR', `User ${req.user? req.user.email : 'undefined'}: Blog retrieve failed. Blog not found (${blog_id})`);
            let error = new Error(`Blog retrieve failed. Published blog with ID \'${blog_id}\' not found.`);
            error.status_code = 400;
            next(error);
        };

        log('INFO', `Blog with ID '${blog_id}' retrieved successfully!`)
        res.status(200).json({
            status: 'retrieved',
            message: 'Blog retrieved successfully!',
            blog
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
            error.status_code = 400;
            next(error);
        };

        const valid_updates = ['title', 'description', 'body', 'tags', 'state'];
        const request_updates = Object.keys(req.body);

        update_is_valid = (updateitem) => valid_updates.includes(updateitem);
        const request_updates_are_valid = request_updates.every(update_is_valid);
        if (!request_updates_are_valid) {
            log('ERROR', `User ${req.user.email}: Blog update failed. Invalid update fields found in request: \n${req.body}`);
            let error = new Error(`Blog update failed. Invalid update fields. Valid fields are: ${valid_updates}`);
            error.status_code = 400;
            next(error);
        };

        const blog = await Blog.findOne({_id:blog_id, author:author_id});
        if (!blog) { log('ERROR', `User ${req.user.email}: Blog update failed. Blog not found (${blog_id})`);
            let error = new Error(`Blog update failed. Blog of yours with ID \'${blog_id}\' not found.`);
            error.status_code = 400;
            next(error);
        };
        log('INFO', `Blog with ID '${blog_id}' retrieved successfully. Updates incoming.`);

        valid_states = ['draft', 'published'];
        request_updates.forEach((update) => {
            if (update === 'state') {
                if (!valid_states.includes(req.body['state'])) {
                    log('ERROR', `User ${req.user.email}: Blog update failed. Invalid state \'${req.body['state']}\'`);
                    let error = new Error(`Blog update failed. Invalid state: \'${req.body['state']}\' Valid states are: ${valid_states}`);
                    error.status_code = 400;
                    next(error);
                }
                blog.state = req.body['state'];
            } else {
                blog[update] = req.body[update];
            }
        });

        await blog.save();
        log('INFO', `Blog with ID '${blog_id}' updated successfully!`);

        res.status(200).json({
            status: 'updated',
            message: 'Blog successfully updated.',
            blog
        });
    } catch (err) {
        next(err);
    }
};

const deleteBlog = async (req, res, next) => {
    try {
        const {blog_id} = req.params;
        const author_id = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(blog_id)) { // to check that the blog ID passed as a request parameter is valid
            log('ERROR', `User ${req.user.email}: Blog delete failed. Invalid Blog ID value (${blog_id})`);
            let error = new Error(`Blog delete failed. Invalid Blog ID value '${blog_id}'`);
            error.status_code = 400;
            next(error);
        };

        const blog = await Blog.findOneAndDelete({_id:blog_id, author:author_id});
        if (!blog) {
            log('ERROR', `User ${req.user.email}: Blog delete failed. Blog with ID '${blog_id}' not found.`);
            let error = new Error(`Blog delete failed. Blog with ID '${blog_id}' not found.`);
            error.status_code = 404;
            next(error);
        }
        log('INFO', `Blog with ID '${blog_id}' deleted successfully.`)

        res.status(204).json({
            status: 'deleted',
            message: `Blog deleted successfully.`
        })
    } catch (err) {
        next(err);
    }

};

const retrievePublishedBlogs = async (req, res, next) => {
    try {
        const page = req.query.page || 1;
        const limit_per_page = req.query.limit || 20;
        const skip = (page-1) * limit_per_page; // the number of documents to skip to get the correct results

        const query = {state: 'published'}; // base query for this endpoint
        const search_query_str = req.query.search;
        const search_queries = [];

        if (search_query_str) {
            search_words = search_query_str.split(' ').filter((word) => word.length > 0);
            if (search_words.length > 0) {
                const search_queries_for_words = search_words.map(word => ({ // for every search term or word, I'm creating a $or array to search the title, description and tags for that word
                    $or: [
                        {title: {$regex: word, $options: 'i'}}, // 'i' to make the search case insensitive
                        {description: {$regex: word, $options: 'i'}},
                        {tags: {$regex: word, $options: 'i'}}
                    ]
                }));
                search_queries.push(search_queries_for_words);
            };

            const matched_authors = await User.find({ // check if searching for authors by the search query brings up results
                $or: [
                    {first_name: {$regex: search_query_str, $options: 'i'}},
                    {last_name: {$regex: search_query_str, $options: 'i'}},
                    {email: {$regex: search_query_str, $options: 'i'}}
                ]
            }).select('_id');

            if (matched_authors.length > 0) {
                const matched_author_ids = matched_authors.map(author => author._id);
                search_queries.push({author: {$in: matched_author_ids}});
            }
        };

        if (search_queries.length > 0) query.$and = search_queries;

        let sort_rule = {'createdAt': -1}; // default is to sort by cretion time, descending order
        const sortby = req.query.sortby;
        const orderby = req.query.orderby;
        const valid_sort_fields = ['read_count', 'reading_time', 'createdAt'];
        if (valid_sort_fields.includes(sortby)) {
            sort_rule = {};
            sort_rule[sortby] = orderby == asc ? 1 : -1; // if orderby is anything other than 'asc', sort in descending order
        }

        const blogs = await Blog.find(query).skip(skip).sort(sort_rule).limit().populate('author', 'first_name last_name email');
        const blogObjects = blogs.map(blog => blog.toObject()); // I got an error, as they didn't serialise properly so I'm explicitly converting the blog to JS Objects
        const total_blogs = await Blog.countDocuments();
        log('INFO', `Blogs succesfully retrieved for user ${req.user? req.user.email : 'undefined'} with skip (${skip}), sort (${sort_rule}), query (${query})`);

        res.status(200).json({
            status: 'retrieved',
            message: 'Published blogs retrieved successfully!',
            blogs: blogObjects,
            total_blogs,
            total_pages: Math.ceil(total_blogs/limit_per_page)
        });
    } catch (err) {
        next(err);
    }

};


module.exports = {
    createBlog,
    retrieveBlog,
    updateBlog,
    deleteBlog,
    retrievePublishedBlogs
};