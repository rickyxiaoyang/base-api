const app = require("./app");
const http = require("http");
const dotenv = require("dotenv");

// Get port from environment and store in Express.
const PORT = process.env.PORT || "5000";
app.set("port", PORT);

// Create HTTP server.
app.listen(
    PORT,
    console.log(
        `Server running on ${process.env.NODE_ENV} on port ${process.env.PORT}`
    )
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log(`Unhandled Error ${err.message}`);
    server.close(() => {
        process.exit(1);
    });
});
