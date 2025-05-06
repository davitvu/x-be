const User = require("../model/User");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
    try {
        const { username, displayName, email, password } = req.body;

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                message: "Email is already registered"
            });
        }

        // Create new user
        const newUser = await new User({
            username,
            displayName,
            email,
            password
        });

        // Save to DB
        const user = await newUser.save();
        res.status(200).json(user);

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email or username already exists' });
        }

        res.status(500).json(error);
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username }).select(`+password`);
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        if (user && isMatch) {
            const accessToken = jwt.sign({
                id: user._id,
                role: user.role,
            },
                process.env.JWT_SECRET,
                { expiresIn: "30d" }
            );

            const { password, ...remainingData } = user._doc;

            res.status(200).json({ accessToken, remainingData });
        }
    } catch (error) {
        res.status(500).json(error);
    }
};