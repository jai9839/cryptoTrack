const isAdminUser = (user) => {
	if (!user) return false;
	if (user.role === "admin") return true;
	const admins = (process.env.ADMIN_USERNAMES || "admin")
		.split(",")
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
	return admins.includes(user.username?.toLowerCase());
};

const requireAdmin = (req, res, next) => {
	if (!req.user || !isAdminUser(req.user)) {
		return res.status(403).json({ error: "Admin access required." });
	}
	next();
};

module.exports = { isAdminUser, requireAdmin };
