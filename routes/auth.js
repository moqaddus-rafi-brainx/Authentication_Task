const express = require('express');
const router = express.Router();

const { signupUser, loginUser,verifyUser,changePassword,forgotPassword,resetPassword } = require('../controllers/auth');
const { authenticateUser }=require('../middlewares/authMiddleware');


router.post('/signup', signupUser);
router.get('/verify',verifyUser);
router.post('/login', loginUser);
router.patch('/changePassword',authenticateUser,changePassword);
router.post('/forgotPassword',forgotPassword);
router.patch('/resetPassword',resetPassword);

module.exports = router;

