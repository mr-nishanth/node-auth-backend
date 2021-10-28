require('dotenv').config({ path: "./config.env" });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit')
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error")
const { logEvent, logger } = require("./middleware/logEvents");
const corsOptions = require("./config/corsOptions");

// Connect DB
connectDB()

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 Mins
    max: 100,
  })
  app.use(limiter)
  app.set('trust proxy', 1)


// ? Added loggers
app.use(logger);

// Cross Origin Resource Sharing
// app.use(cors(corsOptions));

//? middleware:- allow as to get data from the body eg: req.body
app.use(express.json());
//? middleware:- router
app.use("/api/auth",require("./routes/auth.route"))
app.use("/api/private",require("./routes/private.route"))


//app.all is allowed all methods
app.all("*", (req, res) => {
    res.status(404);
    // Check the content-type
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    }
    else if (req.accepts('json')) {
        res.json({error:"404 Not Found"})
    } else {
        res.type("txt").send("404 Not Found")
    }
})

// Error Handler (Should be last piece of middleware)
app.use(errorHandler)

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
process.on("unhandledRejection", (err,promise) => {
    console.log(`Logged Error ${err}`);
    server.close(() => process.exit(1))
})
