const crypto = require("crypto");
const bcrypt = require("bcrypt");
const OtpVerification = require("../models/OtpVerification");

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const generateOtp = () => String(crypto.randomInt(100000, 999999));

const createOtp = async (phoneE164, purpose) => {
	await OtpVerification.deleteMany({ phoneE164, purpose });
	const code = generateOtp();
	const codeHash = await bcrypt.hash(code, 10);
	await OtpVerification.create({
		phoneE164,
		codeHash,
		purpose,
		expiresAt: new Date(Date.now() + OTP_TTL_MS),
	});
	return code;
};

const verifyOtp = async (phoneE164, purpose, code) => {
	const record = await OtpVerification.findOne({ phoneE164, purpose }).sort({ createdAt: -1 });
	if (!record) {
		return { ok: false, error: "OTP expired or not found. Request a new code." };
	}
	if (record.expiresAt < new Date()) {
		await OtpVerification.deleteOne({ _id: record._id });
		return { ok: false, error: "OTP expired. Request a new code." };
	}
	if (record.attempts >= MAX_ATTEMPTS) {
		return { ok: false, error: "Too many failed attempts. Request a new OTP." };
	}
	const match = await bcrypt.compare(String(code).trim(), record.codeHash);
	if (!match) {
		record.attempts += 1;
		await record.save();
		return { ok: false, error: "Invalid OTP. Please try again." };
	}
	await OtpVerification.deleteOne({ _id: record._id });
	return { ok: true };
};

module.exports = { createOtp, verifyOtp, OTP_TTL_MS };
