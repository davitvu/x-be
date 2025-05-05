const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db")

const app = express();
const port = process.env.PORT

connectDB();

app.use(cors());
app.use(cookieParser());
app.use(express.json);

app.get("/", (req, res) => {
    res.send("Hello");
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})
