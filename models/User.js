
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: {
        type: String,
        required: true,
        trim: true,
        minLength: 1
    },
    last_name: {
        type: String,
        required: true,
        trim: true,
        minLength: 1
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w\.-]+@([\w-]+\.)+[\w]{2,4}$/, 'Please enter a valid email.']
    },
    password_hash: {
        type: String,
        required: true
    },
    // createdAt: {
    //     type: Date,
    //     default: Date.now
    // }
}, {
    timestamps: true
});

const User = mongoose.model('User', UserSchema);
module.exports = User;