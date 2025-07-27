const express = require('express');
const controller = require('../controllers/auth_controllers')

const router = express.Router();

// Register
router.post('/api/auth/register', controller.putUserCredentials)

// Login
router.post('/api/auth/login', controller.getUserCredentials)

// Verification
router.get('/api/auth/verified', controller.giveVerified)

// Forgot Password
router.post('/api/auth/forgot-password', controller.forgotPassword)

// Reset Password
router.post('/api/auth/reset-password', controller.resetPassword)

// Session Verification
router.post('/api/auth/jwt', controller.sessionVerification)

module.exports = router;
