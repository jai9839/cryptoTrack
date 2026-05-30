const rateBuckets = new Map();

const rateLimit = (key, maxRequests, windowMs) => {
	const now = Date.now();
	const bucket = rateBuckets.get(key) || { count: 0, resetAt: now + windowMs };
	if (now > bucket.resetAt) {
		bucket.count = 0;
		bucket.resetAt = now + windowMs;
	}
	bucket.count += 1;
	rateBuckets.set(key, bucket);
	return bucket.count <= maxRequests;
};

const otpSendLimiter = (req, res, next) => {
	const ip = req.ip || req.socket.remoteAddress || "unknown";
	const phone = req.body?.phoneE164 || req.body?.countryDial + req.body?.phone || "unknown";
	const key = `otp:${ip}:${phone}`;
	if (!rateLimit(key, 5, 15 * 60 * 1000)) {
		return res.status(429).json({ error: "Too many OTP requests. Try again in 15 minutes." });
	}
	next();
};

const authAttemptLimiter = (req, res, next) => {
	const ip = req.ip || req.socket.remoteAddress || "unknown";
	const key = `auth:${ip}`;
	if (!rateLimit(key, 30, 15 * 60 * 1000)) {
		return res.status(429).json({ error: "Too many login attempts. Try again later." });
	}
	next();
};

const getClientMeta = (req) => ({
	ip: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "",
	userAgent: req.headers["user-agent"] || "",
});

module.exports = { otpSendLimiter, authAttemptLimiter, getClientMeta };
