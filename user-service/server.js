require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`User Service is running on port ${PORT}`);
});

process.on('unhandledRejection', (err, promise) => {
    console.log(`Lỗi Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});