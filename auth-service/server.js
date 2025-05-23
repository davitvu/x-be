const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoute = require("./routes/auth");
const userRoute = require("./routes/user");

dotenv.config();
const port = process.env.PORT
const app = express();

connectDB();

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', // Cấu hình CORS
    credentials: true
}));
app.use(cookieParser());

// ROUTES
app.get("/", (req, res) => {
    res.send("Hello World");
});

// Auth 
app.use("/api/v1/auth", authRoute);

// USER
app.use("/api/v1/user", userRoute);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
});