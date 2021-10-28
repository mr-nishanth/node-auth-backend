const ErrorResponse = require("../utils/errorResponse");
const {logEvent} = require("./logEvents")

const errorHandler = (err, req, res, next) => {
    logEvent(`${err.name} : ${err.message}`, 'errLog');
    // deep copy
    let error = { ...err };
    error.message = err.message;
    if (err.code === 11000) {
        const message = "Duplicate Field Value Enter";
        error = new ErrorResponse(message,400)
    }
    //  In mongoose we get ValidationError , we usually get nested object
    if (err.name === "ValidationError") {
        const message = Object.values(err.error).map((val) => val.message);
        error = new ErrorResponse(message,400)
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error:error.message || "Server Error"
    })
}

module.exports = errorHandler;