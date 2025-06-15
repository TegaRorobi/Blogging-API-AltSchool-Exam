
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const dotenv = require('dotenv');
dotenv.config();


const signup = async (req, res, next) => {
    try {
        const {first_name, last_name, email, password} = req.body;

        if (!first_name || !last_name || !email || !password) {
            res.status(400).json({error: 'Please provide a first_name, last_name, email and password.'});
        };

        let user = await User.findOne({email});
        if (user) {
            res.status(400).json({error: `The email ${email} has already been registered. Kindly login.`});
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
        res.status(400).json({error: err.message});
    }
};

module.exports = {signup};