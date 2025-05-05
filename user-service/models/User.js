// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    dateOfBirth: { type: Date, required: true },
    phoneNumber: { type: String, unique: true, sparse: true, index: true },
    password: { type: String }, // buoc 3
    username: { type: String, unique: true, sparse: true, index: true, lowercase: true }, // buoc 5
    profileImageUrl: { type: String, default: 'default_avatar_url' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String },
    emailVerificationCodeExpires: { type: Date },
    registrationStep: { type: Number, default: 0 }, // 0: init, 1: email sent, 2: email verified, 3: password set, 4: pic set, 5: username set, 6: interests set, 7: complete
    isRegistrationComplete: { type: Boolean, default: false },
    interests: [String],
    allowNotifications: { type: Boolean, default: true },
    joinDate: { type: Date, default: Date.now },
    bio: { type: String, maxlength: 160 },
    location: { type: String },
    website: { type: String },
    authProvider: { type: String, enum: ['email', 'google', 'apple'], default: 'email' },
    providerId: { type: String },
}, { timestamps: true });

// Hash password truoc khi luu neu no duoc thay doi
UserSchema.pre('save', async function (next) {
    // Chi hash password neu no moi hoac duoc thay doi
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method de so sanh mat khau (instance method)
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        throw err; // Nem loi ra ngoai de controller xu ly
    }
};

module.exports = mongoose.model('User', UserSchema);