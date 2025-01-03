const UserService = require('../services/UserService')
const JwtService = require('../services/JwtService')

const nodemailer = require('nodemailer');
const User = require('../models/Users');
const PasswordResetCode = require('../models/PasswordResetCodes');
const bcrypt = require("bcrypt")

const createUser = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        const isCheckEmail = reg.test(email);

        // Regular expression for password validation
        const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const isValidPassword = passwordReg.test(password);

        if (!username && !email && !password && !confirmPassword) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Please input your information',
            });
        } else if (!username) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Please input your username',
            });
        } else if (!email) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Please input your email',
            });
        } else if (!password) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Please input your password',
            });
        } else if (!isCheckEmail) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Email format is invalid. Please check the email and try again.',
            });
        } else if (!isValidPassword) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
            });
        } else if (password !== confirmPassword) {
            return res.status(404).json({
                status: 'ERR',
                message: "Passwords don't match. Please try again.",
            });
        }

        const response = await UserService.createUser(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = reg.test(email)

        if (!email && !password) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Please input your email and password'
            })
        } else if (!email) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Please input your email'
            })
        } else if (!password) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Please input your password'
            })
        } else if (!isCheckEmail) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Email format is invalid. Please check the email and try again.'
            })
        }
        const response = await UserService.loginUser(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id
        const data = req.body
        if (!userId) {
            return res.status(404).json({
                status: 'ERR',
                message: 'The userId is required'
            })
        }

        const response = await UserService.updateUser(userId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getDetailsUser = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(404).json({
                status: 'ERR',
                message: 'The userId is required'
            });
        }

        const response = await UserService.getDetailsUser(id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            status: 'ERR',
            message: e.message || e,
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const token = req.headers.token.split(' ')[1]
        if (!token) {
            return res.status(404).json({
                status: 'ERR',
                message: 'The token is required'
            })
        }

        const response = await JwtService.refreshTokenJwtService(token)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const logoutUser = async (req, res) => {
    try {
        const userId = req.params.id

        if (!userId) {
            return res.status(401).json({
                status: 'ERR',
                message: 'Unauthorized. User ID is missing.',
            });
        }

        const response = await UserService.logoutUser(userId);
        return res.status(200).json(response);
    } catch (e) {
        console.error('Error during logout: ', e);
        return res.status(500).json({
            status: 'ERR',
            message: e.message || 'An error occurred during logout',
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Validate input
        if (!email || !username || !password) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Email, username, and password are required.',
            });
        }

        // Regular expression for password validation
        const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const isValidPassword = passwordReg.test(password);

        if (!isValidPassword) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
            });
        }

        const response = await UserService.updatePassword(req.body);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e.message || e,
        });
    }
};

const generateCode = () => {
    return Math.floor(100000000 + Math.random() * 900000000); // Generates a 9-digit number
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ status: 'ERR', message: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: 'ERR', message: 'User not found.' });
        }

        // Generate a 9-digit code
        const code = generateCode();
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10); // Set expiry to 10 minutes

        // Save the code in the PasswordResetCode collection
        const resetCode = new PasswordResetCode({
            email,
            code,
            expiryDate
        });
        await resetCode.save();

        // Xóa mã sau 2 phút (120,000ms)
        setTimeout(async () => {
            await PasswordResetCode.deleteOne({ _id: resetCode._id });
            console.log(`Password reset code for ${email} has been deleted.`);
        }, 120000); // 2 phút

        // Create transporter using email credentials from .env
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Allow insecure connections if needed
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Your Password',
            html: `
                <p>We received a request to reset your password. Use the following code to reset your password:</p>
                <h2>${code}</h2>
                <p>If you didn't request a password reset, please ignore this email.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ status: 'SUCCESS', message: 'Reset code sent to your email.' });
    } catch (error) {
        res.status(500).json({ status: 'ERR', message: error.message });
    }
};

const verifyEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ status: 'ERR', message: 'Email is required.' });
    }

    try {
        // Generate a 9-digit code
        const code = generateCode();
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10); // Set expiry to 10 minutes

        // Save the code in the PasswordResetCode collection
        const verifyCode = new PasswordResetCode({
            email,
            code,
            expiryDate
        });
        await verifyCode.save();

        // Xóa mã sau 2 phút (120,000ms)
        setTimeout(async () => {
            await PasswordResetCode.deleteOne({ _id: verifyCode._id });
            console.log(`Verify code for ${email} has been deleted.`);
        }, 120000); // 2 phút

        // Create transporter using email credentials from .env
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Allow insecure connections if needed
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify Your Email Address',
            html: `
                <p>Welcome to AI Study Planer. Use the following code to confirm your registration:</p>
                <h2>${code}</h2>
                <p>If you didn't sign up to AI Study Planer, please ignore this email.</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ status: 'SUCCESS', message: 'Verify code sent to your email.' });
    } catch (error) {
        res.status(500).json({ status: 'ERR', message: error.message });
    }
};

const verifyResetCode = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ status: 'ERR', message: 'Email and code are required.' });
    }

    try {
        // Tìm mã reset theo email và mã code
        const resetCode = await PasswordResetCode.findOne({ email, code: parseInt(code, 10) });

        if (!resetCode) {
            return res.status(400).json({ status: 'ERR', message: 'Invalid or expired code.' });
        }

        // Kiểm tra xem mã đã được sử dụng chưa
        if (resetCode.used) {
            return res.status(400).json({ status: 'ERR', message: 'Code has already been used.' });
        }

        // Kiểm tra mã có hết hạn hay không
        const currentDate = new Date();
        if (resetCode.expiryDate < currentDate) {
            return res.status(400).json({ status: 'ERR', message: 'Code has expired.' });
        }

        // Đánh dấu mã là đã sử dụng
        resetCode.used = true;
        await resetCode.save();

        // Sau khi xác minh mã hợp lệ, cho phép người dùng tiếp tục đổi mật khẩu
        res.status(200).json({ status: 'SUCCESS', message: 'Code verified, proceed to reset password.' });

        // Bạn có thể xóa mã sau khi sử dụng nếu không muốn lưu trữ lại
        // await PasswordResetCode.deleteOne({ _id: resetCode._id });

    } catch (error) {
        res.status(500).json({ status: 'ERR', message: error.message });
    }
};

const verifyEmailCode = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ status: 'ERR', message: 'Email and code are required.' });
    }

    try {
        // Tìm mã reset theo email và mã code
        const verifyCode = await PasswordResetCode.findOne({ email, code: parseInt(code, 10) });

        if (!verifyCode) {
            return res.status(400).json({ status: 'ERR', message: 'Invalid or expired code.' });
        }

        // Kiểm tra xem mã đã được sử dụng chưa
        if (verifyCode.used) {
            return res.status(400).json({ status: 'ERR', message: 'Code has already been used.' });
        }

        // Kiểm tra mã có hết hạn hay không
        const currentDate = new Date();
        if (verifyCode.expiryDate < currentDate) {
            return res.status(400).json({ status: 'ERR', message: 'Code has expired.' });
        }

        // Đánh dấu mã là đã sử dụng
        verifyCode.used = true;
        await verifyCode.save();

        // Sau khi xác minh mã hợp lệ, cho phép người dùng tiếp tục đổi mật khẩu
        res.status(200).json({ status: 'SUCCESS', message: 'Code verified, proceed to sign up.' });

        // Bạn có thể xóa mã sau khi sử dụng nếu không muốn lưu trữ lại
        // await PasswordResetCode.deleteOne({ _id: resetCode._id });

    } catch (error) {
        res.status(500).json({ status: 'ERR', message: error.message });
    }
};

const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        return res.status(400).json({ status: 'ERR', message: 'Email and new password are required.' });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: 'ERR', message: 'User not found.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ status: 'SUCCESS', message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(500).json({ status: 'ERR', message: error.message });
    }
};

// Upload avatar và cập nhật đường dẫn trong MongoDB
const uploadAvatar = async (req, res) => {
    try {
        const userId = req.params.id;
        const avatarUrl = req.file.path; // URL ảnh từ Multer

        const user = await User.findByIdAndUpdate(
            userId,
            { avatar: avatarUrl },
            { new: true }
        );

        res.status(200).json({
            message: 'Avatar uploaded successfully',
            user,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload avatar', details: error.message });
    }
};

module.exports = {
    createUser,
    loginUser,
    updateUser,
    getDetailsUser,
    refreshToken,
    logoutUser,
    updatePassword,
    forgotPassword,
    verifyEmail,
    verifyResetCode,
    verifyEmailCode,
    resetPassword,
    uploadAvatar
}