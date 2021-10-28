const {logEvent} = require("./logEvents")

const errorHandler = (err, req, res, next) => {
    logEvent(`${err.name} : ${err.message}`, 'errLog');
    // console.log(err.stack);
    res.send(500).send(err.message)
}
module.exports = errorHandler;