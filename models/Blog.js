
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        minLength: 20,
        required: false,
        trim: true
    },
    body: {
        type: String,
        minLength: 20,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    state: {
        type: String,
        required: true,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    tags: [{
        type: String,
        trim: true,
        minLength: 1,
    }],
    read_count: {
        type: Number,
        default: 0
    },
    reading_time: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

// A lookup says it's about 238, but I'll use this as my baseline
const WORDS_PER_MINUTE = 200;

const calculateApproxReadingMinutes = (text) {
    if (!text) return 0;

    let words = text.trim().split(/\s+/).filter(word => word.length > 0);
    let readingMinutes = Math.ceil(words.length / WORDS_PER_MINUTE);
    return readingMinutes; // todo: What if the reading minutes > 60 or < 1?
}

BlogSchema.pre('save', (next) => {
    // calculate the approximate reading minutes for this new instance
    this.reading_time = calculateApproxReadingMinutes(this.body);

    next();
});

const Blog = mongoose.model('Blog', BlogSchema);
module.exports = BlogSchema;