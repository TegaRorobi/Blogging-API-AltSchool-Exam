
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const dotenv = require('dotenv');
dotenv.config();

const log = (level, message) => console.log(`[${new Date().toISOString()}] [AUTH_CONTROLLER] ${level}: ${message}`);

const signup = async (req, res, next) => {
    try {
        const {first_name, last_name, email, password} = req.body;

        if (!first_name || !last_name || !email || !password) {
            log('ERROR', 'Attribute first_name, last_name, email or password not provided.');
            let error = new Error('Please provide a first_name, last_name, email and password.');
            error.status_code = 400;
            return next(error); // pass it on, and it'll be handled by the error handler
        };

        let user = await User.findOne({email});
        if (user) {
            log('ERROR', 'Email already taken.');
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
        log('INFO', 'New User saved successfully!');

        res.status(201).json({
            status: 201,
            message: 'User registered successfully!'
        });

    } catch (err) {
        next(err); // ditto
    }
};


const login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if (!user) {
            log('ERROR', `User account with email ${email} not found.`);
            let error = new Error(`User account with email ${email} does not exist. Proceed to login.`);
            error.status_code = 404;
            next(error);
        };

        password_match = await bcrypt.compare(password, user.password_hash);
        if (!password_match) {
            log('ERROR', `User account with email ${email} not found.`);
            let error = new Error(`User account with email ${email} does not exist. Proceed to login.`);
            error.status_code = 400;
            next(error);
        };

        payload = {
            id: user._id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
        }

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '1h'} // as required in the project description
        )
        log('INFO', `User account with email ${user.email} logged in successfully!`);

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: payload
        })


    } catch (err) {
        next(err);
    }
};

module.exports = {signup, login};