const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UsersSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},

	password: {
		type: String,
		required: true,
	},

	phoneE164: {
		type: String,
		unique: true,
		sparse: true,
		trim: true,
	},

	countryCode: {
		type: String,
		default: "",
	},

	phoneVerified: {
		type: Boolean,
		default: false,
	},

	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user",
	},

	lastLoginAt: { type: Date },
	lastLoginIp: { type: String, default: "" },

	watchlist: {
		type: [String],
		required: true,
		default: [],
	},

	portfolio: {
		type: Map,
		of: {
			totalInvestment: {
				type: Number,
				required: true,
				default: 0,
			},
			coins: {
				type: Number,
				required: true,
				default: 0,
			},
		},

		default: {},
	},

	walletBalance: {
		type: Number,
		default: 0,
		required: true,
	},

	transactions: {
		type: [{
			type: {
				type: String,
				enum: ["deposit", "withdrawal"],
				required: true,
			},
			amount: {
				type: Number,
				required: true,
			},
			status: {
				type: String,
				enum: ["success", "pending", "failed"],
				default: "success",
			},
			paymentId: {
				type: String,
				default: "",
			},
			method: {
				type: String,
				default: "Simulated",
			},
			createdAt: {
				type: Date,
				default: Date.now,
			},
		}],
		default: [],
	},
});

UsersSchema.pre("save", async function (next) {
	const user = this;
	if (!user.isModified("password")) {
		return next();
	}

	try {
		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(user.password, salt);
		user.password = hashed;
		next();
	} catch (err) {
		next(err);
	}
});

UsersSchema.methods.comparePassword = async function (enteredPassword) {
	try {
		const isPassword = await bcrypt.compare(enteredPassword, this.password);
		return isPassword;
	} catch (err) {
		throw err;
	}
};

const User = mongoose.model("Users", UsersSchema);

module.exports = User;
