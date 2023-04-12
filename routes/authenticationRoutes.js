const express = require('express');
const router = express.Router();
const {login, signup, signupOTP} = require('../controllers/authentication');

router.route('/signup').post(signup);

router.route('/signupOTP').post(signupOTP);

router.route('/login').post(login);

module.exports = router;