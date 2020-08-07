const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const ErrorResponse = require("./utils/errorResponse");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
//Load env vars
dotenv.config({ path: "./config/config.env" });

//Connect to Database
connectDB();

//Initiate app
const app = express();

//Body Parser
app.use(express.json());

//Cookie Parser
app.use(cookieParser());

//Dev logging middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use("/api/v1/auth", authRoutes);

//Error handling
app.use((req, res, next) => {
    next(new ErrorResponse(`Not Found`, 404));
});

app.use(errorHandler);

module.exports = app;
