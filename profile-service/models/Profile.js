const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    displayName: { type: String, require: true },
    bio: { type: String, maxlength: 160 },
    avatar: { type: String, default: "url" },
    headerImage: { type: String, default: "url" },
    joinDate: { type: Date, default: Date.now },
    location: { type: String },
    website: { type: String },
    followingCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    tweetCount: { type: String, default: 0 },
    lastSeen: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('Profile', UserSchema);