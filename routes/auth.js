const express = require('express');
const router = express.Router();

const { signupUser, loginUser,verifyUser,changePassword,forgotPassword,resetPassword } = require('../controllers/auth');
const { authenticateUser }=require('../middlewares/authMiddleware');


router.post('/signup', signupUser);
router.get('/verify',verifyUser);
router.post('/login', loginUser);
router.patch('/change-password',authenticateUser,changePassword);
router.post('/forgot-password',forgotPassword);
router.patch('/reset-password',resetPassword);

module.exports = router;

