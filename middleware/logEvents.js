const { format } = require('date-fns');
// { v4: uuid } v4 as uuid
const { v4: uuid } = require("uuid");

const fs = require('fs');
const fsPromise = require('fs').promises;
const path = require('path');

const logEvent = async (message,filename) => {
    const dateTime = `${format(new Date(), 'yyyy-MM-dd \t HH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message} \n`
    // console.log(logItem);
    try {
        // ".." is denoted the one step back to current folder
        if (!fs.existsSync(path.join(__dirname,"..", 'logs'))) {
            await fsPromise.mkdir(path.join(__dirname,"..", 'logs'));
        }
        await fsPromise.appendFile(path.join(__dirname,"..", 'logs', `${filename}.txt`),logItem)
    } catch (error) {
            // console.log(error)
    }
}
//* Noted if you create the custom middleware the next is most be added in parameter in anonymous function
const logger =  (req, res, next) => {
    logEvent(`${req.method}\t${req.headers.origin}\t${req.url}`,'reqLog')
    // console.log(`${req.method} ${req.path}`)
    // console.log(`${req.method}\t${req.headers.origin}\t${req.url}`)
    next();
}
module.exports = {logEvent,logger};