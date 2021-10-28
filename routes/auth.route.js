const express = require('express');
const router = express.Router();
const apicache = require('apicache');
const {
    register,
    login,
    forgotPassword,
    resetPassword
} = require("../controllers/auth");

// Init cache
// let cache = apicache.middleware;
// cache('2 minutes')

// router.post("/register")
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/forgotpassword").post(forgotPassword);

// the resetToken get in params
router.route("/resetpassword/:resetToken").put(resetPassword);

module.exports = router;