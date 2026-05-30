const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true, index: true },
	username: { type: String, required: true },
	action: { type: String, required: true },
	path: { type: String, default: "" },
	method: { type: String, default: "" },
	ip: { type: String, default: "" },
	userAgent: { type: String, default: "" },
	metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
	createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
