// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

// --- Registration Routes ---
router.post(
    '/register/step1/initiate',
    [
        body('name', 'Name is required').not().isEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('dateOfBirth', 'Date of birth is required and should be YYYY-MM-DD').isISO8601().toDate(),
        validateRequest // Middleware để kiểm tra lỗi validation
    ],
    authController.registerStep1Initiate
);

router.post(
    '/register/step2/verify-email',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('verificationCode', 'Verification code is required').not().isEmpty(),
        validateRequest
    ],
    authController.registerStep2VerifyEmail
);

router.post(
    '/register/step3/set-password',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        validateRequest
    ],
    authController.registerStep3SetPassword
);

router.post('/register/step4/set-profile-picture', authController.registerStep4SetProfilePicture); // Cần xử lý file upload ở đây hoặc dùng URL từ Media service

router.post(
    '/register/step5/set-username',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('username', 'Username is required and should be valid').matches(/^[a-zA-Z0-9_]{4,15}$/), // Ví dụ: 4-15 chars, letters, numbers, underscore
        validateRequest
    ],
    authController.registerStep5SetUsername
);

router.post('/register/step6/set-interests', authController.registerStep6SetInterests);

router.post(
    '/register/step7/complete',
    [
        body('email', 'Please include a valid email').isEmail(),
        // body('allowNotifications').isBoolean().optional(), // Validate nếu cần
        validateRequest
    ],
    authController.registerStep7Complete
);


// --- Login Routes ---
router.post(
    '/login/check-identifier',
    [
        body('identifier', 'Identifier (email, username, or phone) is required').not().isEmpty(),
        validateRequest
    ],
    authController.loginCheckIdentifier
);

router.post(
    '/login/password',
    [
        body('identifier', 'Identifier is required').not().isEmpty(),
        body('password', 'Password is required').not().isEmpty(),
        validateRequest
    ],
    authController.loginPassword
);

module.exports = router;