
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const dotenv = require('dotenv');
dotenv.config();


const signup = async (req, res, next) => {
    try {
        const {first_name, last_name, email, password} = req.body;

        if (!first_name || !last_name || !email || !password) {
            let error = new Error('Please provide a first_name, last_name, email and password.');
            error.status_code = 400;
            return next(error); // pass it on, and it'll be handled by the error handler
        };

        let user = await User.findOne({email});
        if (user) {
            let error = new Error(`The email ${email} has already been registered. Kindly login.`);
            error.status_code = 400;
            return next(error); // same here
        };

        const hashing_salt = await bcrypt.genSalt(10);
        const hashed_password = await bcrypt.hash(password, hashing_salt);

        user = new User({
            first_name,
            last_name,
            email,
            password_hash: hashed_password
        });

        await user.save();
        console.log('New User saved successfully!');

        res.status(201).json({
            status: 201,
            message: 'User registered successfully!'
        });

    } catch (err) {
        next(err); // ditto
    }
};

module.exports = {signup};