const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
	phoneE164: { type: String, required: true, index: true },
	codeHash: { type: String, required: true },
	purpose: { type: String, enum: ["register", "login", "verify"], required: true },
	attempts: { type: Number, default: 0 },
	expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("OtpVerification", OtpSchema);
