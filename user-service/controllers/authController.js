const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
    try {
        const { username, displayName, email, password } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await new User({
            username,
            displayName,
            email,
            password: hashed,
        });

        // Save to DB
        const user = await newUser.save();
        res.status(200).json(user);

    } catch (error) {
        res.status(500).json(error);
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).json("Wrong username!");
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(404).json("Wrong password!")
        }

        if (user && validPassword) {
            res.status(200).json(user);
        }
    } catch (error) {
        res.status(500).json(error);
    }
};