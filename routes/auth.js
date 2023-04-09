const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
require('dotenv').config()
const jwt_sec = process.env.JWT_SECRET;
const requireLogin = require('../middleware/requireLogin')



router.post('/signup', (req, res) => {
    // Extract user data from request body
    const { name, email, password } = req.body;

    // Check if all required fields are present
    if (!email || !name || !password) {
        // If any required field is missing, return a 400 Bad Request error response with an error message
        return res.status(400).json({ error: "Please provide all required fields" });
    }

    // Check if a user with the provided email already exists
    User.findOne({ email: email })
        .then((savedUser) => {
            if (savedUser) {
                // If a user with that email already exists, return a 409 Conflict error response with an error message
                return res.status(409).json({ error: "A user with that email already exists" });
            }

            // Hash the password using the bcrypt module
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    // If there is an error generating the salt, log the error and return a 500 Internal Server Error response with an error message
                    console.log(err);
                    return res.status(500).json({ error: "Internal server error" });
                }

                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        // If there is an error hashing the password, log the error and return a 500 Internal Server Error response with an error message
                        console.log(err);
                        return res.status(500).json({ error: "Internal server error" });
                    }

                    // Create a new User object with the provided data
                    const user = new User({
                        email,
                        password: hash,
                        name,
                    });

                    // Save the new user to the database
                    user.save()
                        .then(() => {
                            // If the user is saved successfully, return a 201 Created success response with a success message
                            res.status(201).json({ message: "User created successfully" });
                        })
                        .catch(err => {
                            // If there is an error saving the user, log the error and return a 500 Internal Server Error response with an error message
                            console.log(err);
                            res.status(500).json({ error: "Internal server error" });
                        });
                });
            });
        })
        .catch(err => {
            // If there is an error finding the user, log the error and return a 500 Internal Server Error response with an error message
            console.log(err);
            res.status(500).json({ error: "Internal server error" });
        });
});

router.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // Check if all required fields are present
    if (!email || !password) {
        // If any required field is missing, return a 400 Bad Request error response with an error message
        return res.status(400).json({ error: "Please provide email and password" });
    }

    // Find the user with the provided email in the database
    User.findOne({ email: email })
        .then((savedUser) => {
            if (!savedUser) {
                // If no user with that email exists, return a 401 Unauthorized error response with an error message
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Use bcrypt to compare the provided password with the hashed password stored in the database

            bcrypt.compare(password, savedUser.password)
                .then(doMatch => {
                    if (doMatch) {
                        const token = jwt.sign({ _id: savedUser._id }, jwt_sec)
                        const { _id, name, email } = savedUser
                        res.json({ token, user: { _id, name, email } }) //token:token
                    }
                    else {
                        return res.status(422).json({ error: "Invalid Email or Password" })
                    }
                })
                .catch((err) => {
                    // If there is an error finding the user, log the error and return a 500 Internal Server Error response with an error message
                    console.log(err);
                    res.status(500).json({ error: "Internal server error" });

                })

        });

})


module.exports = router;