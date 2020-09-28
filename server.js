const app = require("./app");
const debug = require("debug")("node-angular");
const http = require("http");
const dotenv = require("dotenv");

// Get port from environment and store in Express.
const PORT = process.env.PORT || "5000";
app.set("port", PORT);

// // Create HTTP server.
// app.listen(
//     PORT,
//     console.log(
//         `Server running on ${process.env.NODE_ENV} on port ${process.env.PORT}`
//     )
// );

const onError = (error) => {
    if (error.syscall == "listen") {
        throw error;
    }

    const bind = typeof PORT === "string" ? "pipe " + PORT : "port " + PORT;
    switch (error.code) {
        case "EACCES":
            console.error(bind + " required elevated privileges");
            process.exit(1);
            break;
        case "EADDRINUSE":
            console.error(bind + " is already in use");
            process.exit(1);
            break;
        default:
            throw error;
    }
};

const onListening = () => {
    const addr = server.address();
    const bind = typeof PORT === "string" ? "pipe " + PORT : "port " + PORT;
    debug("Listening on " + bind);
};

const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(PORT);

// //Handle unhandled promise rejections
// process.on("unhandledRejection", (err, promise) => {
//     console.log(`Unhandled Error ${err.message}`);
//     // app.close(() => {
//     //     process.exit(1);
//     // });
// });
