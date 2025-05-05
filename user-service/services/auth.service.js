const User = require('../models/User');
const emailService = require('./emailService'); // Service gửi email
const { generateToken } = require('../utils/helpers'); // Hàm tạo JWT
const crypto = require('crypto'); // Để tạo mã verification

// --- Registration Logic ---
exports.initiateRegistration = async (name, email, dateOfBirth) => {
    // 1. Kiem tra email da ton tai va hoan tat dang ky chua
    let user = await User.findOne({ email, isRegistrationComplete: true });
    if (user) {
        throw new Error('Email already in use');
    }

    // 2. Tìm hoặc tạo user đăng ký dở dang
    user = await User.findOneAndUpdate(
        { email, isRegistrationComplete: false }, // Tìm user dở dang
        { // Dữ liệu để tạo mới hoặc cập nhật
            name,
            email,
            dateOfBirth,
            isEmailVerified: false,
            isRegistrationComplete: false,
            registrationStep: 0, // Reset bước nếu đăng ký lại
            authProvider: 'email', // Đảm bảo set provider
            $unset: { // Xóa các trường không cần thiết nếu đăng ký lại
                password: "",
                username: "",
                profileImageUrl: "",
                interests: "",
                emailVerificationCode: "",
                emailVerificationCodeExpires: ""
            }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true } // Tạo nếu chưa có, trả về bản ghi mới
    );

    // 3. Tạo mã xác thực và thời gian hết hạn
    const verificationCode = crypto.randomInt(100000, 999999).toString(); // 6 chữ số
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    user.emailVerificationCode = verificationCode;
    user.emailVerificationCodeExpires = verificationCodeExpires;
    user.registrationStep = 1; // Đánh dấu đã qua bước 1
    await user.save();

    // 4. Gửi email (KHÔNG chặn xử lý - nên dùng queue trong thực tế)
    try {
        await emailService.sendVerificationEmail(email, verificationCode);
        console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
        console.error(`Failed to send verification email to ${email}:`, emailError);
        // Có thể log lỗi nhưng vẫn trả về thành công cho user, hoặc xử lý khác
    }


    return { success: true, message: 'Verification code sent to email.' };
};

exports.verifyEmailCode = async (email, verificationCode) => {
    const user = await User.findOne({
        email,
        isRegistrationComplete: false,
        registrationStep: 1 // Chỉ xác thực nếu đang ở bước này
    });

    if (!user) {
        return { success: false, message: 'User not found or not at the correct registration step.' };
    }

    if (user.emailVerificationCode !== verificationCode || user.emailVerificationCodeExpires < new Date()) {
        return { success: false, message: 'Invalid or expired verification code.' };
    }

    // Xác thực thành công
    user.isEmailVerified = true;
    user.emailVerificationCode = undefined; // Xóa code
    user.emailVerificationCodeExpires = undefined; // Xóa expiry
    user.registrationStep = 2; // Chuyển sang bước tiếp theo
    await user.save();

    return { success: true };
};

exports.setPasswordForRegistration = async (email, password) => {
    const user = await User.findOne({
        email,
        isEmailVerified: true, // Phải xác thực email rồi
        isRegistrationComplete: false,
        registrationStep: 2 // Chỉ set pass nếu đang ở bước này
    });

    if (!user) {
        return { success: false, message: 'User not found or not at the correct registration step.' };
    }

    user.password = password; // Mongoose pre-save hook sẽ hash mật khẩu
    user.registrationStep = 3;
    await user.save();

    return { success: true };
};

// ... (Implement logic cho các bước 4, 6 tương tự) ...

exports.setUsernameForRegistration = async (email, username) => {
    // Kiểm tra tính duy nhất của username trước
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
        return { success: false, message: 'Username already taken.', statusCode: 409 };
    }

    const user = await User.findOne({
        email,
        isRegistrationComplete: false,
        registrationStep: 4 // Hoặc 3 nếu không có bước ảnh
    });

    if (!user) {
        return { success: false, message: 'User not found or not at the correct registration step.' };
    }

    user.username = username.toLowerCase(); // Lưu username dạng lowercase
    user.registrationStep = 5;
    await user.save();

    return { success: true };
}


exports.completeRegistration = async (email /*, allowNotifications */) => {
    const user = await User.findOne({
        email,
        isRegistrationComplete: false,
        registrationStep: 6 // Hoặc 5 nếu bỏ qua bước 6
    });

    if (!user) {
        return { success: false, message: 'User not found or not at the correct registration step.' };
    }

    // if (allowNotifications !== undefined) user.allowNotifications = allowNotifications;
    user.isRegistrationComplete = true;
    user.registrationStep = 7; // Đánh dấu hoàn thành
    await user.save();

    // Tạo token đăng nhập
    const token = generateToken(user._id);
    const userResponse = user.toObject(); // Chuyển thành object thường
    delete userResponse.password; // Xóa password khỏi response
    delete userResponse.emailVerificationCode;
    delete userResponse.emailVerificationCodeExpires;
    delete userResponse.registrationStep;


    return { success: true, user: userResponse, token };
};

// --- Login Logic ---
exports.checkIdentifierExists = async (identifier) => {
    const query = identifier.includes('@')
        ? { email: identifier.toLowerCase() }
        : /^[0-9]+$/.test(identifier) // Check if it looks like a phone number
            ? { phoneNumber: identifier }
            : { username: identifier.toLowerCase() }; // Assume username otherwise

    const user = await User.findOne({ ...query, isRegistrationComplete: true });

    return { exists: !!user };
};

exports.loginWithPassword = async (identifier, password) => {
    const query = identifier.includes('@')
        ? { email: identifier.toLowerCase() }
        : /^[0-9]+$/.test(identifier)
            ? { phoneNumber: identifier }
            : { username: identifier.toLowerCase() };

    const user = await User.findOne({ ...query, isRegistrationComplete: true });

    if (!user) {
        return { success: false, message: 'Invalid credentials or account not found.' };
    }

    // So sánh mật khẩu (model method)
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return { success: false, message: 'Invalid credentials.' };
    }

    // Tạo token
    const token = generateToken(user._id);
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationCode;
    delete userResponse.emailVerificationCodeExpires;
    delete userResponse.registrationStep;

    return { success: true, user: userResponse, token };
};