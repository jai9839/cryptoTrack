const mongoose = require("mongoose");

const LoginLogSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", default: null },
	username: { type: String, default: "" },
	phoneE164: { type: String, default: "" },
	countryCode: { type: String, default: "" },
	success: { type: Boolean, required: true },
	method: { type: String, default: "password_otp" },
	ip: { type: String, default: "" },
	userAgent: { type: String, default: "" },
	failureReason: { type: String, default: "" },
	createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("LoginLog", LoginLogSchema);
