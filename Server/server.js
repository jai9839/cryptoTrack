const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const db = require("./db");
require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("./models/Users");
const PORT = process.env.PORT || 3000;
const app = express();

let razorpayInstance = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
	razorpayInstance = new Razorpay({
		key_id: process.env.RAZORPAY_KEY_ID,
		key_secret: process.env.RAZORPAY_KEY_SECRET,
	});
}

app.use(helmet());
app.use(compression());
app.use(
	cors({
		origin: (origin, callback) => {
			const allowedOrigins = [
				process.env.CLIENT,
				"http://localhost:5173",
				"http://127.0.0.1:5173",
				"http://localhost:5174",
				"http://127.0.0.1:5174",
			];

			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	})
);

app.use(express.json());
const passport = require("./auth");
const securityRoutes = require("./routes/securityRoutes");
const { logUserActivity } = require("./middleware/activityLogger");
const { getClientMeta } = require("./middleware/securityMiddleware");

app.set("trust proxy", 1);
app.use(passport.initialize());

app.use((req, res, next) => {
	req.clientMeta = getClientMeta(req);
	next();
});

app.use("/auth", securityRoutes);

app.get("/", (req, res) => {
	return res.send("API is running");
});

app.get("/currency", async (req, res) => {
	try {
		const response = await fetch("https://api.frankfurter.app/latest?from=USD");
		if (!response.ok) {
			return res.status(response.status).json({ error: "Failed to fetch currency rates" });
		}

		const data = await response.json();
		return res.json(data);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
});

const BINANCE_BASE = "https://api.binance.com/api/v3";
const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

async function fetchBinance(path, res) {
	try {
		const response = await fetch(`${BINANCE_BASE}${path}`);
		const data = await response.json();
		if (!response.ok) {
			return res.status(response.status).json({ error: data || "Binance request failed" });
		}
		return res.json(data);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
}

async function fetchCoinGecko(path, res) {
	try {
		const response = await fetch(`${COINGECKO_BASE}${path}`);
		const data = await response.json();
		if (!response.ok) {
			return res.status(response.status).json({ error: data || "CoinGecko request failed" });
		}
		res.set("Cache-Control", "public, max-age=60");
		return res.json(data);
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
}

app.get("/binance/ticker24hr", (req, res) => {
	const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();
	return fetchBinance(`/ticker/24hr?symbol=${symbol}`, res);
});

app.get("/binance/depth", (req, res) => {
	const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();
	const limit = Math.min(Math.max(Number(req.query.limit) || 100, 5), 500);
	return fetchBinance(`/depth?symbol=${symbol}&limit=${limit}`, res);
});

app.get("/binance/klines", (req, res) => {
	const symbol = (req.query.symbol || "BTCUSDT").toUpperCase();
	const interval = req.query.interval || "1m";
	const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 500);
	return fetchBinance(`/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`, res);
});

app.get("/coingecko/coins/markets", (req, res) => {
	const ids = req.query.ids ? `&ids=${encodeURIComponent(req.query.ids)}` : "";
	const page = Number(req.query.page) || 1;
	const perPage = Math.min(Math.max(Number(req.query.per_page) || 100, 1), 250);
	return fetchCoinGecko(
		`/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=7d${ids}`,
		res
	);
});

app.get("/coingecko/coins/:id", (req, res) => {
	const id = encodeURIComponent(req.params.id);
	const localization = req.query.localization === "false" ? "false" : "true";
	const tickers = req.query.tickers === "false" ? "false" : "true";
	return fetchCoinGecko(
		`/coins/${id}?localization=${localization}&tickers=${tickers}&market_data=true&community_data=false&developer_data=false&sparkline=false`,
		res
	);
});

const cryptoData = require("./cryptoData");

app.get("/cryptos", (req, res) => {
	const { ids, q } = req.query;
	let list = cryptoData;

	if (ids) {
		const requestedIds = ids
			.split(",")
			.map((id) => id.trim().toLowerCase());
		list = list.filter((coin) => requestedIds.includes(coin.id.toLowerCase()));
	}

	if (q) {
		const normalized = q.toLowerCase();
		list = list.filter(
			(coin) =>
				coin.name.toLowerCase().includes(normalized) ||
				coin.symbol.toLowerCase().includes(normalized) ||
				coin.id.toLowerCase().includes(normalized)
		);
	}

	return res.json(list);
});

app.get("/cryptos/:id", (req, res) => {
	const coin = cryptoData.find((item) => item.id === req.params.id.toLowerCase());
	if (!coin) {
		return res.status(404).json({ error: "Coin not found" });
	}
	return res.json(coin);
});

const protectedAuth = [
	passport.authenticate("jwt", { session: false }),
	logUserActivity,
];

app.get(
	"/watchlist",
	...protectedAuth,
	async (req, res) => {
		try {
			const userId = req.user._id;
			const user = await User.findById(userId);
			if (!user) {
				return res.status(404).json({ Error: "User not Found" });
			}

			return res.json({ watchlist: user.watchlist });
		} catch (err) {
			return res.status(500).json({ error: err.message || err });
		}
	}
);

app.get(
	"/portfolio",
	...protectedAuth,
	async (req, res) => {
		try {
			const userId = req.user._id;
			const user = await User.findById(userId);
			if (!user) {
				return res.status(404).json({ Error: "User not Found" });
			}

			return res.json(user.portfolio);
		} catch (err) {
			return res.status(500).json({ error: err.message || err });
		}
	}
);

app.put(
	"/watchlist/add",
	...protectedAuth,
	async (req, res) => {
		const userId = req.user._id;
		const coin = req.body.coin;
		try {
			const user = await User.findByIdAndUpdate(
				userId,
				{ $addToSet: { watchlist: coin } },
				{ new: true }
			);

			if (!user) {
				return res.status(404).json({ Error: "User not Found" });
			}

			return res.status(200).json({ watchlist: user.watchlist });
		} catch (err) {
			return res.status(500).json(err.message);
		}
	}
);

app.put(
	"/watchlist/remove",
	...protectedAuth,
	async (req, res) => {
		const userId = req.user._id;
		const coin = req.body.coin;
		try {
			const user = await User.findByIdAndUpdate(
				userId,
				{ $pull: { watchlist: coin } },
				{ new: true }
			);

			if (!user) {
				return res.status(404).json({ Error: "User not Found" });
			}

			return res.status(200).json({ watchlist: user.watchlist });
		} catch (err) {
			return res.status(500).json(err.message);
		}
	}
);

app.put(
	"/portfolio/update",
	...protectedAuth,
	async (req, res) => {
		const userId = req.user._id;
		const { coin, coinData } = req.body;

		try {
			if (
				!coin ||
				!coinData ||
				typeof coinData.totalInvestment !== "number" ||
				typeof coinData.coins !== "number"
			) {
				return res.status(400).json({ error: "Invalid input data" });
			}

			const user = await User.findById(userId);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			const portfolio = user.portfolio;
			const existingCoinData = portfolio.get(coin);

			if (existingCoinData) {
				const newCoins = existingCoinData.coins + coinData.coins;

				if (coinData.coins < 0) {
					const sellAmount = Math.abs(coinData.coins);
					const ownedCoins = existingCoinData.coins;

					if (sellAmount > ownedCoins) {
						return res.status(400).json({
							error: `Cannot sell ${sellAmount} coins. You only own ${ownedCoins} coins.`,
						});
					}
				}

				if (newCoins <= 0) {
					portfolio.delete(coin);
				} else {
					let newTotalInvestment;

					if (coinData.coins < 0) {
						const remainingRatio =
							newCoins / existingCoinData.coins;
						newTotalInvestment =
							existingCoinData.totalInvestment * remainingRatio;
					} else {
						newTotalInvestment =
							existingCoinData.totalInvestment +
							coinData.totalInvestment;
					}

					existingCoinData.totalInvestment = newTotalInvestment;
					existingCoinData.coins = newCoins;
					portfolio.set(coin, existingCoinData);
				}
			} else {
				if (coinData.totalInvestment > 0 && coinData.coins > 0) {
					portfolio.set(coin, coinData);
				} else if (coinData.coins < 0) {
					return res.status(400).json({
						error: "Cannot sell coins that are not in your portfolio",
					});
				}
			}

			user.markModified("portfolio");

			const updatedUser = await user.save();
			return res.status(200).json(updatedUser.portfolio);
		} catch (err) {
			return res.status(500).json(err.message);
		}
	}
);

// Wallet Endpoints
app.get(
	"/wallet",
	...protectedAuth,
	async (req, res) => {
		try {
			const user = await User.findById(req.user._id);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}
			return res.json({
				balance: user.walletBalance || 0,
				transactions: user.transactions || [],
				isMockMode: !razorpayInstance,
				razorpayKeyId: process.env.RAZORPAY_KEY_ID || ""
			});
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}
);

app.post(
	"/wallet/deposit/mock",
	...protectedAuth,
	async (req, res) => {
		try {
			const { amount, method } = req.body;
			if (!amount || isNaN(amount) || amount <= 0) {
				return res.status(400).json({ error: "Invalid deposit amount" });
			}

			const user = await User.findById(req.user._id);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			const transaction = {
				type: "deposit",
				amount: Number(amount),
				status: "success",
				paymentId: `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
				method: method || "Simulated",
				createdAt: new Date()
			};

			user.walletBalance = (user.walletBalance || 0) + Number(amount);
			user.transactions.unshift(transaction);
			await user.save();

			return res.json({
				message: "Mock deposit successful",
				balance: user.walletBalance,
				transactions: user.transactions
			});
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}
);

app.post(
	"/wallet/deposit/order",
	...protectedAuth,
	async (req, res) => {
		try {
			const { amount } = req.body;
			if (!amount || isNaN(amount) || amount <= 0) {
				return res.status(400).json({ error: "Invalid deposit amount" });
			}

			if (!razorpayInstance) {
				return res.status(400).json({
					error: "Razorpay is not configured. Please use mock deposit or configure credentials.",
					isMockMode: true
				});
			}

			const options = {
				amount: Math.round(Number(amount) * 100), // Razorpay accepts in paise
				currency: "INR",
				receipt: `receipt_wallet_${Date.now()}`,
			};

			const order = await razorpayInstance.orders.create(options);
			return res.json({
				success: true,
				order
			});
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}
);

app.post(
	"/wallet/deposit/verify",
	...protectedAuth,
	async (req, res) => {
		try {
			const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

			if (!razorpayInstance) {
				return res.status(400).json({ error: "Razorpay is not configured." });
			}

			const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
			hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
			const generated_signature = hmac.digest("hex");

			if (generated_signature !== razorpay_signature) {
				return res.status(400).json({ error: "Transaction verification failed. Invalid signature." });
			}

			const user = await User.findById(req.user._id);
			if (!user) {
				return res.status(404).json({ error: "User not found" });
			}

			const transaction = {
				type: "deposit",
				amount: Number(amount),
				status: "success",
				paymentId: razorpay_payment_id,
				method: "Razorpay",
				createdAt: new Date()
			};

			user.walletBalance = (user.walletBalance || 0) + Number(amount);
			user.transactions.unshift(transaction);
			await user.save();

			return res.json({
				message: "Payment verified and wallet credited successfully",
				balance: user.walletBalance,
				transactions: user.transactions
			});
		} catch (err) {
			return res.status(500).json({ error: err.message });
		}
	}
);

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
