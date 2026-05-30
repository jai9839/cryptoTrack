const ActivityLog = require("../models/ActivityLog");

const ACTION_MAP = {
	"GET /portfolio": "view_portfolio",
	"PUT /portfolio/update": "update_portfolio",
	"GET /watchlist": "view_watchlist",
	"PUT /watchlist/add": "add_watchlist",
	"PUT /watchlist/remove": "remove_watchlist",
	"GET /coingecko": "browse_market",
	"GET /binance": "browse_market",
};

const logUserActivity = (req, res, next) => {
	const originalJson = res.json.bind(res);
	res.json = (body) => {
		if (req.user && res.statusCode < 400) {
			const key = `${req.method} ${req.path.split("?")[0]}`;
			const action =
				ACTION_MAP[key] ||
				`${req.method.toLowerCase()}_${req.path.replace(/\//g, "_").slice(0, 40)}`;
			ActivityLog.create({
				userId: req.user._id,
				username: req.user.username,
				action,
				path: req.originalUrl,
				method: req.method,
				ip: req.clientMeta?.ip || "",
				userAgent: req.clientMeta?.userAgent || "",
				metadata: { statusCode: res.statusCode },
			}).catch((err) => console.error("Activity log error:", err.message));
		}
		return originalJson(body);
	};
	next();
};

module.exports = { logUserActivity };
