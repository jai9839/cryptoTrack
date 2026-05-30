const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("../auth");
const User = require("../models/Users");
const LoginLog = require("../models/LoginLog");
const ActivityLog = require("../models/ActivityLog");
const { parsePhone, maskPhone } = require("../utils/phoneUtils");
const { createOtp, verifyOtp } = require("../utils/otpService");
const { sendOtpSms } = require("../utils/smsService");
const { otpSendLimiter, authAttemptLimiter, getClientMeta } = require("../middleware/securityMiddleware");
const { requireAdmin } = require("../middleware/adminAuth");

const router = express.Router();

const attachMeta = (req, res, next) => {
	req.clientMeta = getClientMeta(req);
	next();
};

const logLoginAttempt = async ({ userId, username, phoneE164, countryCode, success, req, failureReason }) => {
	try {
		await LoginLog.create({
			userId,
			username: username || "",
			phoneE164: phoneE164 || "",
			countryCode: countryCode || "",
			success,
			ip: req.clientMeta?.ip || "",
			userAgent: req.clientMeta?.userAgent || "",
			failureReason: failureReason || "",
		});
	} catch (err) {
		console.error("Login log error:", err.message);
	}
};

const issueToken = (user) => {
	const payload = {
		id: user._id,
		username: user.username,
		role: user.role,
		phoneVerified: user.phoneVerified,
	};
	const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
	return {
		token,
		user: {
			id: user._id,
			username: user.username,
			phone: maskPhone(user.phoneE164),
			phoneVerified: user.phoneVerified,
			countryCode: user.countryCode,
			role: user.role,
		},
	};
};

router.use(attachMeta);

router.post("/otp/send", otpSendLimiter, async (req, res) => {
	const { countryDial, phone, purpose } = req.body;
	const parsed = parsePhone(countryDial, phone);
	if (!parsed.valid) {
		return res.status(400).json({ error: parsed.error });
	}

	if (!["register", "login", "verify"].includes(purpose)) {
		return res.status(400).json({ error: "Invalid OTP purpose." });
	}

	if (purpose === "register") {
		const exists = await User.findOne({ phoneE164: parsed.phoneE164 });
		if (exists) {
			return res.status(400).json({ error: "This phone number is already registered." });
		}
	}

	if (purpose === "login") {
		const { username } = req.body;
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ error: "User not found." });
		}
		if (user.phoneE164 !== parsed.phoneE164) {
			return res.status(400).json({ error: "Phone number does not match this account." });
		}
	}

	try {
		const code = await createOtp(parsed.phoneE164, purpose);
		const sms = await sendOtpSms(parsed.phoneE164, code, purpose);
		return res.json({
			message: `OTP sent to ${maskPhone(parsed.phoneE164)}`,
			phoneE164: parsed.phoneE164,
			expiresInMinutes: 10,
			...(sms.devOtp && process.env.OTP_DEV_MODE === "true" ? { devOtp: sms.devOtp } : {}),
		});
	} catch (err) {
		return res.status(500).json({ error: "Failed to send OTP. Configure Twilio or enable OTP_DEV_MODE." });
	}
});

router.post("/register", authAttemptLimiter, async (req, res) => {
	const { username, password, countryDial, phone, countryCode, otp } = req.body;
	const parsed = parsePhone(countryDial, phone);
	if (!parsed.valid) {
		return res.status(400).json({ error: parsed.error });
	}
	if (!username || !password || password.length < 8) {
		return res.status(400).json({ error: "Username and password (min 8 chars) required." });
	}
	if (!otp) {
		return res.status(400).json({ error: "OTP is required to complete registration." });
	}

	const otpResult = await verifyOtp(parsed.phoneE164, "register", otp);
	if (!otpResult.ok) {
		return res.status(400).json({ error: otpResult.error });
	}

	try {
		const existingUser = await User.findOne({
			$or: [{ username }, { phoneE164: parsed.phoneE164 }],
		});
		if (existingUser) {
			return res.status(400).json({ error: "Username or phone already exists." });
		}

		const admins = (process.env.ADMIN_USERNAMES || "admin")
			.split(",")
			.map((s) => s.trim().toLowerCase());
		const role = admins.includes(username.toLowerCase()) ? "admin" : "user";

		const newUser = new User({
			username,
			password,
			phoneE164: parsed.phoneE164,
			countryCode: countryCode || `+${parsed.countryDial}`,
			phoneVerified: true,
			role,
		});
		await newUser.save();

		await logLoginAttempt({
			userId: newUser._id,
			username,
			phoneE164: parsed.phoneE164,
			countryCode: countryCode || "",
			success: true,
			req,
			failureReason: "",
		});

		return res.status(200).json({
			message: "Account created. Phone verified successfully.",
			...issueToken(newUser),
		});
	} catch (err) {
		return res.status(500).json({ error: err.message || "Registration failed" });
	}
});

router.post("/login", authAttemptLimiter, (req, res, next) => {
	passport.authenticate("local", { session: false }, async (err, user, info) => {
		if (err) {
			return res.status(500).json({ error: "Authentication error" });
		}
		if (!user) {
			await logLoginAttempt({
				username: req.body.username,
				success: false,
				req,
				failureReason: info?.message || "Invalid credentials",
			});
			return res.status(400).json({ error: "Invalid credentials", step: "credentials" });
		}

		const { otp, countryDial, phone } = req.body;

		if (!user.phoneVerified) {
			if (!otp) {
				return res.status(200).json({
					message: "Add and verify your phone number to secure your account.",
					step: "setup_phone",
					needsPhoneSetup: true,
				});
			}
			const { countryDial, phone } = req.body;
			const parsed = parsePhone(countryDial, phone);
			if (!parsed.valid) {
				return res.status(400).json({ error: parsed.error, step: "setup_phone" });
			}
			const otpResult = await verifyOtp(parsed.phoneE164, "verify", otp);
			if (!otpResult.ok) {
				return res.status(400).json({ error: otpResult.error, step: "setup_phone" });
			}
			const taken = await User.findOne({ phoneE164: parsed.phoneE164, _id: { $ne: user._id } });
			if (taken) {
				return res.status(400).json({ error: "Phone already used by another account." });
			}
			user.phoneE164 = parsed.phoneE164;
			user.countryCode = req.body.countryCode || `+${parsed.countryDial}`;
			user.phoneVerified = true;
			await user.save();
			await logLoginAttempt({ userId: user._id, username: user.username, phoneE164: parsed.phoneE164, success: true, req });
			user.lastLoginAt = new Date();
			user.lastLoginIp = req.clientMeta?.ip || "";
			await user.save();
			return res.status(200).json({ message: "Phone verified. Login complete.", step: "complete", ...issueToken(user) });
		}

		if (!otp) {
			try {
				const code = await createOtp(user.phoneE164, "login");
				const sms = await sendOtpSms(user.phoneE164, code, "login");
				return res.json({
					message: `OTP sent to ${maskPhone(user.phoneE164)}`,
					step: "otp",
					phone: maskPhone(user.phoneE164),
					...(sms.devOtp && process.env.OTP_DEV_MODE === "true" ? { devOtp: sms.devOtp } : {}),
				});
			} catch (e) {
				return res.status(500).json({ error: "Failed to send login OTP." });
			}
		}

		const otpResult = await verifyOtp(user.phoneE164, "login", otp);
		if (!otpResult.ok) {
			await logLoginAttempt({
				userId: user._id,
				username: user.username,
				phoneE164: user.phoneE164,
				success: false,
				req,
				failureReason: otpResult.error,
			});
			return res.status(400).json({ error: otpResult.error, step: "otp" });
		}

		await logLoginAttempt({
			userId: user._id,
			username: user.username,
			phoneE164: user.phoneE164,
			countryCode: user.countryCode,
			success: true,
			req,
		});

		user.lastLoginAt = new Date();
		user.lastLoginIp = req.clientMeta?.ip || "";
		await user.save();

		return res.status(200).json({
			message: "Login successful",
			step: "complete",
			...issueToken(user),
		});
	})(req, res, next);
});

router.get(
	"/admin/overview",
	passport.authenticate("jwt", { session: false }),
	requireAdmin,
	async (req, res) => {
		try {
			const [totalUsers, recentLogins, recentActivity, failedLogins] = await Promise.all([
				User.countDocuments(),
				LoginLog.find().sort({ createdAt: -1 }).limit(50).lean(),
				ActivityLog.find().sort({ createdAt: -1 }).limit(100).lean(),
				LoginLog.countDocuments({ success: false, createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
			]);

			const users = await User.find()
				.select("username phoneE164 countryCode phoneVerified role lastLoginAt lastLoginIp createdAt")
				.sort({ lastLoginAt: -1 })
				.limit(100)
				.lean();

			const safeUsers = users.map((u) => ({
				...u,
				phoneE164: maskPhone(u.phoneE164),
			}));

			return res.json({
				stats: {
					totalUsers,
					failedLogins24h: failedLogins,
					activeSessionsNote: "JWT sessions expire in 24 hours",
				},
				users: safeUsers,
				loginLogs: recentLogins.map((l) => ({
					...l,
					phoneE164: maskPhone(l.phoneE164),
				})),
				activityLogs: recentActivity,
			});
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}
);

router.get(
	"/admin/activity/:userId",
	passport.authenticate("jwt", { session: false }),
	requireAdmin,
	async (req, res) => {
		try {
			const logs = await ActivityLog.find({ userId: req.params.userId })
				.sort({ createdAt: -1 })
				.limit(200)
				.lean();
			return res.json({ activity: logs });
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}
);

module.exports = router;
