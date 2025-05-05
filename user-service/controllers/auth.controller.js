const authService = require('../services/auth.service');

exports.registerStep1Initiate = async (req, res, next) => {
    try {
        const { name, email, dateOfBirth } = req.body;
        const result = await authService.initiateRegistration(name, email, dateOfBirth);
        res.status(200).json(result);
    } catch (error) {
        if (error.message === 'Email already in use') {
            return res.status(409).json({ message: error.message });
        }
        console.error("Error in registerStep1Initiate:", error);
        res.status(500).json({ message: 'Server error during registration initiation' });
        // next(error); // Hoặc dùng global error handler
    }
};

exports.registerStep2VerifyEmail = async (req, res, next) => {
    try {
        const { email, verificationCode } = req.body;
        const result = await authService.verifyEmailCode(email, verificationCode);
        if (!result.success) {
            return res.status(400).json(result); // code sai hoac het han
        }
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in registerStep2VerifyEmail:", error);
        res.status(500).json({ message: 'Server error during email verification' });
    }
};

exports.registerStep3SetPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.setPasswordForRegistration(email, password);
        if (!result.success) {
            // User khong o dung buoc hoac khong tim thay
            return res.status(400).json(result);
        }
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in registerStep3SetPassword:", error);
        res.status(500).json({ message: 'Server error setting password' });
    }
};

// ... (Implement các controller khác cho step 4, 5, 6, 7 tương tự)

exports.registerStep5SetUsername = async (req, res, next) => {
    try {
        const { email, username } = req.body;
        const result = await authService.setUsernameForRegistration(email, username);
        if (!result.success) {
            // Username đã tồn tại hoặc user không ở đúng bước
            return res.status(result.statusCode || 400).json({ message: result.message });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in registerStep5SetUsername:", error);
        res.status(500).json({ message: 'Server error setting username' });
    }
};


exports.registerStep7Complete = async (req, res, next) => {
    try {
        const { email } = req.body; // Lấy thêm allowNotifications nếu cần
        const result = await authService.completeRegistration(email /*, allowNotifications */);
        if (!result.success) {
            // User không ở đúng bước
            return res.status(400).json(result);
        }
        // Đăng nhập thành công sau khi hoàn tất đăng ký
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in registerStep7Complete:", error);
        res.status(500).json({ message: 'Server error completing registration' });
    }
};

// --- Login Controllers ---
exports.loginCheckIdentifier = async (req, res, next) => {
    try {
        const { identifier } = req.body;
        const result = await authService.checkIdentifierExists(identifier);
        if (!result.exists) {
            return res.status(404).json(result);
        }
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in loginCheckIdentifier:", error);
        res.status(500).json({ message: 'Server error checking identifier' });
    }
};

exports.loginPassword = async (req, res, next) => {
    try {
        const { identifier, password } = req.body;
        const result = await authService.loginWithPassword(identifier, password);
        if (!result.success) {
            // Sai mật khẩu hoặc không tìm thấy user
            return res.status(401).json({ message: result.message });
        }
        res.status(200).json(result);
    } catch (error) {
        console.error("Error in loginPassword:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Implement các controller khác cho các bước đăng ký còn lại (4, 5, 6)
exports.registerStep4SetProfilePicture = async (req, res, next) => { /* ... */ };
exports.registerStep6SetInterests = async (req, res, next) => { /* ... */ };