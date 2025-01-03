const express = require('express');
const router = express.Router()
const userController = require('../controllers/UserController');
const { authMiddleware } = require('../middleware/authMiddleware');
const passport = require('passport');
const upload = require('../middleware/multer');

router.post('/register', userController.createUser)
router.post('/login', userController.loginUser)

router.put('/update-user/:id', authMiddleware(), userController.updateUser)

router.get('/profile/:id', authMiddleware(), userController.getDetailsUser)

router.post('/refresh-token', userController.refreshToken),

router.post('/logout/:id', authMiddleware(), userController.logoutUser);

router.post('/update-password', userController.updatePassword);

router.post('/forgot-password', userController.forgotPassword);

router.post('/verify-code', userController.verifyResetCode);

router.post('/reset-password', userController.resetPassword);

router.post('/verify-email', userController.verifyEmail);
router.post('/verify-email-code', userController.verifyEmailCode);

// Route upload avatar
router.post('/upload-avatar/:id', upload.single('avatar'), userController.uploadAvatar);

router.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const user = req.user; // Lấy thông tin user từ GoogleStrategy
        res.redirect(`http://localhost:3000/google-login-success?email=${user.email}&username=${user.username}`);
    }
);

module.exports = router