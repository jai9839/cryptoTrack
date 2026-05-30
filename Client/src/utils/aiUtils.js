const usdFormatter = (value) => {
	if (value == null || Number.isNaN(value)) {
		return "$0.00";
	}
	return `$${Number(value).toLocaleString(undefined, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})}`;
};

const getRiskLevel = (coin) => {
	const change24h = Math.abs(coin.price_change_percentage_24h || 0);
	const change7d = Math.abs(coin.price_change_percentage_7d_in_currency || 0);
	const score = Math.max(change24h, change7d);

	if (score >= 12) {
		return "High";
	}

	if (score >= 5) {
		return "Medium";
	}

	return "Low";
};

export const getAIPredictions = (coins) => {
	return coins.map((coin) => {
		const score =
			0.6 * (coin.price_change_percentage_24h || 0) +
			0.4 * (coin.price_change_percentage_7d_in_currency || 0);
		const label =
			score > 1
				? `Based on momentum, ${coin.name} may increase by ${score.toFixed(1)}% soon.`
				: score < -1
				? `Based on current weakness, ${coin.name} may decline by ${Math.abs(
					score.toFixed(1)
				)}%.`
				: `${coin.name} looks range-bound in the near term.`;

		return {
			name: coin.name,
			currentPrice: usdFormatter(coin.current_price),
			label,
		};
	});
};

export const getAIRiskAnalysis = (coins) => {
	return coins.map((coin) => ({
		name: coin.name,
		level: getRiskLevel(coin),
		reason: `24h: ${coin.price_change_percentage_24h?.toFixed(1)}%, 7d: ${coin.price_change_percentage_7d_in_currency?.toFixed(1)}%`,
	}));
};

export const getPriceAlerts = (coins) => {
	return coins
		.filter((coin) => {
			const change24h = coin.price_change_percentage_24h || 0;
			return Math.abs(change24h) >= 6 || coin.current_price >= 50000;
		})
		.map((coin) => {
			const change24h = coin.price_change_percentage_24h || 0;
			const direction = change24h >= 0 ? "rose" : "fell";
			return `${coin.name} ${direction} ${Math.abs(change24h).toFixed(1)}% in the last 24h. Current price is ${usdFormatter(
				coin.current_price
			)}.`;
		});
};

export const getAIMarketSentiment = (coins) => {
	if (!coins.length) {
		return "No market data available yet.";
	}

	const average24h =
		coins.reduce(
			(acc, coin) => acc + (coin.price_change_percentage_24h || 0),
			0
		) / coins.length;

	if (average24h > 1.2) {
		return "Positive market sentiment";
	}

	if (average24h < -1.2) {
		return "Negative market sentiment";
	}

	return "Neutral market sentiment";
};

export const getAIRecommendations = (portfolio, coins) => {
	const portfolioKeys = Object.keys(portfolio);
	if (!portfolioKeys.length || !coins.length) {
		return "Add coins to your portfolio to unlock personalized AI investment recommendations.";
	}

	const totalInvestment = portfolioKeys.reduce(
		(acc, coinId) => acc + (portfolio[coinId].totalInvestment || 0),
		0
	);

	const sorted = [...coins].sort(
		(a, b) =>
			(b.current_price * (portfolio[b.id]?.coins || 0) || 0) -
			(a.current_price * (portfolio[a.id]?.coins || 0) || 0)
	);

	const topHolding = sorted[0];
	const topShare =
		((portfolio[topHolding.id]?.coins || 0) * topHolding.current_price || 0) /
		Math.max(totalInvestment, 1);

	const stableSymbols = ["usdt", "usdc", "busd", "dai"];
	const hasStableCoin = coins.some((coin) =>
		stableSymbols.includes(coin.symbol.toLowerCase())
	);

	const averageVolatility =
		coins.reduce(
			(acc, coin) => acc + Math.abs(coin.price_change_percentage_24h || 0),
			0
		) / coins.length;

	const recommendations = [];

	if (topShare > 0.6) {
		recommendations.push(
			`Your largest holding is ${topHolding.name}. Consider diversifying to reduce concentration risk.`
		);
	}

	if (!hasStableCoin) {
		recommendations.push(
			"Add a small allocation to stablecoins like USDT/USDC for downside protection."
		);
	}

	if (averageVolatility >= 8) {
		recommendations.push(
			"Your portfolio shows high volatility; a more balanced allocation may reduce risk."
		);
	}

	if (recommendations.length === 0) {
		return "Your portfolio is relatively balanced. Keep monitoring market moves and rebalance when needed.";
	}

	return recommendations.join(" ");
};

export const getAIInsights = (portfolio, coins) => {
	const portfolioKeys = Object.keys(portfolio);
	if (!portfolioKeys.length || !coins.length) {
		return "No portfolio data yet. Add coins to see insights and predictions.";
	}

	const totalInvestment = portfolioKeys.reduce(
		(acc, coinId) => acc + (portfolio[coinId].totalInvestment || 0),
		0
	);

	const currentValue = coins.reduce((acc, coin) => {
		const holding = portfolio[coin.id];
		if (!holding) return acc;
		return acc + holding.coins * coin.current_price;
	}, 0);

	const profit = totalInvestment ? ((currentValue - totalInvestment) / totalInvestment) * 100 : 0;
	const biggestGainer = coins.reduce((best, coin) => {
		if (!best) return coin;
		return (coin.price_change_percentage_24h || 0) >
			(best.price_change_percentage_24h || 0)
			? coin
			: best;
	}, null);

	return `Your portfolio is currently ${profit >= 0 ? "up" : "down"} ${Math.abs(
		profit
	).toFixed(1)}% with a total value of ${usdFormatter(currentValue)}. ${
		biggestGainer
			? `${biggestGainer.name} is the strongest mover today with ${biggestGainer.price_change_percentage_24h?.toFixed(1)}% change.`
			: "Review your holdings for additional insights."
	}`;
};

const findCoin = (input, coins) => {
	const normalized = input.toLowerCase();
	return coins.find(
		(coin) =>
			normalized.includes(coin.id.toLowerCase()) ||
			normalized.includes(coin.symbol.toLowerCase()) ||
			normalized.includes(coin.name.toLowerCase())
	);
};

const evaluateMathExpression = (input) => {
	const match = input.match(/(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)/);
	if (!match) {
		return null;
	}

	const a = parseFloat(match[1]);
	const operator = match[2];
	const b = parseFloat(match[3]);
	let result;

	switch (operator) {
		case "+":
			result = a + b;
			break;
		case "-":
			result = a - b;
			break;
		case "*":
			result = a * b;
			break;
		case "/":
			result = b === 0 ? null : a / b;
			break;
		default:
			return null;
	}

	if (result === null || Number.isNaN(result) || !Number.isFinite(result)) {
		return "That math expression looks invalid. Try a simpler calculation like 12 + 8 or 25 / 5.";
	}

	return `The result of ${a} ${operator} ${b} is ${result}.`;
};

const getGeneralKnowledgeResponse = (normalized) => {
	const definitions = {
		"array in java":
			"In Java, an array is a fixed-size container that holds elements of the same type. You declare it with a type and length, for example `int[] numbers = new int[5];`, and access elements by numeric index.",
		"java array":
			"A Java array is an ordered collection of elements with the same data type. The size is fixed when created, and elements are accessed by zero-based index.",
		"array":
			"An array is a collection of items stored at contiguous memory positions, accessed by an index. It is used to hold multiple values of the same data type.",
		"java":
			"Java is a high-level, object-oriented programming language that runs on the Java Virtual Machine (JVM) and is used for building cross-platform applications.",
		"blockchain":
			"A blockchain is a decentralized ledger that records transactions in cryptographic blocks. It is commonly used to secure cryptocurrencies and distributed systems.",
		"cryptocurrency":
			"Cryptocurrency is digital currency secured by cryptography and typically built on blockchain technology. Bitcoin and Ethereum are two of the most famous examples.",
		"bitcoin":
			"Bitcoin is the first cryptocurrency, designed as a decentralized digital store of value and payment system that does not rely on central banks.",
		"ethereum":
			"Ethereum is a blockchain platform that enables smart contracts and decentralized applications. Its native token is ether (ETH).",
		"machine learning":
			"Machine learning is a branch of artificial intelligence that trains models to recognize patterns in data and make predictions without explicit step-by-step programming.",
		"artificial intelligence":
			"Artificial intelligence refers to systems that can perform tasks that normally require human intelligence, such as reasoning, learning, and pattern recognition.",
		"html":
			"HTML is the markup language used to structure content on the web, defining elements like headings, paragraphs, lists, links, and images.",
		"css":
			"CSS is a style language used to control the appearance of HTML elements, including layout, colors, fonts, and spacing.",
		"python":
			"Python is a popular programming language known for its readability, simplicity, and extensive libraries for data analysis, web development, and automation.",
		"javascript":
			"JavaScript is a programming language used primarily in web browsers to add interactivity to websites and build modern web applications.",
	};

	for (const key of Object.keys(definitions)) {
		if (normalized.includes(key)) {
			return definitions[key];
		}
	}

	if (normalized.includes("hello") || normalized.includes("hi") || normalized.includes("hey")) {
		return "Hello! I can help with questions about crypto, finance, technology, science, history, and everyday topics. What would you like to know?";
	}

	if (normalized.includes("thank you") || normalized.includes("thanks")) {
		return "You're welcome! Feel free to ask me anything else.";
	}

	if (normalized.includes("how are you")) {
		return "I'm an AI assistant here to help you. Ask me anything from crypto trends to science, history, or daily life tips.";
	}

	if (normalized.match(/\b(what|who|when|where|why|how)\b/)) {
		if (normalized.includes("capital of france")) {
			return "Paris is the capital of France, known for landmarks like the Eiffel Tower and the Louvre Museum.";
		}
		if (normalized.includes("speed of light")) {
			return "The speed of light in a vacuum is about 299,792 kilometers per second (approximately 186,282 miles per second).";
		}
		if (normalized.includes("largest planet")) {
			return "Jupiter is the largest planet in our solar system, with strong storms and a famous Great Red Spot.";
		}
		if (normalized.includes("water boiling point")) {
			return "Water boils at 100°C (212°F) at sea level under normal atmospheric pressure.";
		}
	}

	if (normalized.includes("celsius to fahrenheit")) {
		return "To convert Celsius to Fahrenheit, multiply by 9/5 and add 32. For example, 20°C is 68°F.";
	}

	if (normalized.includes("fahrenheit to celsius")) {
		return "To convert Fahrenheit to Celsius, subtract 32 and multiply by 5/9. For example, 68°F is 20°C.";
	}

	if (normalized.includes("define ") || normalized.includes("what is ") || normalized.includes("explain ")) {
		return "I can provide explanations and definitions on a wide range of topics. Please ask your question in a complete sentence and I'll answer it directly.";
	}

	return null;
};

export const getAIChatResponse = (input, coins, portfolio) => {
	const normalized = input.trim().toLowerCase().replace(/\bwaht\b/g, "what");
	const mathReply = evaluateMathExpression(normalized);
	if (mathReply) {
		return mathReply;
	}

	const generalReply = getGeneralKnowledgeResponse(normalized);
	if (generalReply) {
		return generalReply;
	}

	const coin = findCoin(normalized, coins);
	const topGainer = coins.reduce((best, coin) => {
		if (!best) return coin;
		return (coin.price_change_percentage_24h || 0) >
			(best.price_change_percentage_24h || 0)
				? coin
					: best;
	}, null);

	if (normalized.includes("what is bitcoin") || normalized.includes("explain bitcoin")) {
		return "Bitcoin is the original cryptocurrency and a decentralized digital store of value. Its price is driven by demand, adoption, and market cycles.";
	}

	if (normalized.includes("what is ethereum") || normalized.includes("explain ethereum")) {
		return "Ethereum is a decentralized blockchain platform for smart contracts and decentralized applications. Its native token is ether (ETH).";
	}

	if (normalized.includes("trending") || normalized.includes("hot coin") || normalized.includes("gainer")) {
		return topGainer
			? `${topGainer.name} is currently the strongest mover in your tracked coins with a ${topGainer.price_change_percentage_24h?.toFixed(1)}% 24h change.`
			: "No trending coin data is available yet.";
	}

	if (normalized.includes("risk")) {
		const riskLines = getAIRiskAnalysis(coins)
			.map((item) => `${item.name}: ${item.level}`)
			.join("; ");
		return `Risk summary: ${riskLines}`;
	}

	if (normalized.includes("sentiment")) {
		return getAIMarketSentiment(coins);
	}

	if (normalized.includes("portfolio") || normalized.includes("investment")) {
		return getAIRecommendations(portfolio, coins);
	}

	if (normalized.includes("price") && coin) {
		return `${coin.name} currently trades at ${usdFormatter(coin.current_price)} with a 24h change of ${coin.price_change_percentage_24h?.toFixed(1)}%.`;
	}

	if (coin) {
		return `${coin.name} is trading at ${usdFormatter(coin.current_price)} with a 24h move of ${coin.price_change_percentage_24h?.toFixed(1)}%.`;
	}

	return "I can answer a wide range of questions across crypto, finance, tech, science, history, and daily life. Ask me anything and I’ll do my best to help.";
};
// ===== AI INVESTMENT ADVISOR =====
export const getPortfolioAnalysis = (portfolio, coins) => {
	const portfolioKeys = Object.keys(portfolio);
	if (!portfolioKeys.length || !coins.length) {
		return {
			riskLevel: "No Data",
			diversification: "No Data",
			recommendation: "Add coins to your portfolio to unlock AI analysis.",
			allocation: [],
		};
	}

	const totalInvestment = portfolioKeys.reduce(
		(acc, coinId) => acc + (portfolio[coinId].totalInvestment || 0),
		0
	);

	const currentValue = coins.reduce((acc, coin) => {
		const holding = portfolio[coin.id];
		if (!holding) return acc;
		return acc + holding.coins * coin.current_price;
	}, 0);

	const allocation = coins
		.filter((coin) => portfolio[coin.id])
		.map((coin) => {
			const value = portfolio[coin.id].coins * coin.current_price;
			const percentage = (value / currentValue) * 100;
			return {
				name: coin.name,
				symbol: coin.symbol.toUpperCase(),
				percentage: percentage.toFixed(1),
				value: value.toFixed(2),
				change: coin.price_change_percentage_24h || 0,
			};
		})
		.sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage));

	const averageVolatility =
		coins.reduce(
			(acc, coin) => {
				if (!portfolio[coin.id]) return acc;
				return acc + Math.abs(coin.price_change_percentage_24h || 0);
			},
			0
		) / Math.max(portfolioKeys.length, 1);

	const maxAllocation = Math.max(...allocation.map((a) => parseFloat(a.percentage)), 0);
	const diversificationScore = portfolioKeys.length >= 5 ? "Good" : portfolioKeys.length >= 3 ? "Fair" : "Poor";

	let riskLevel = "Low";
	if (averageVolatility > 8 || maxAllocation > 60) {
		riskLevel = "High";
	} else if (averageVolatility > 5 || maxAllocation > 40) {
		riskLevel = "Medium";
	}

	const recommendations = [];
	if (maxAllocation > 60) {
		recommendations.push(`Your largest position (${allocation[0].name}) is ${allocation[0].percentage}% of portfolio - consider rebalancing.`);
	}
	if (portfolioKeys.length < 3) {
		recommendations.push(`Add more coins to reduce single-asset risk. Currently holding only ${portfolioKeys.length} coin(s).`);
	}
	if (averageVolatility > 8) {
		recommendations.push("High volatility detected. Consider adding stable positions to reduce portfolio swings.");
	}

	return {
		riskLevel,
		diversification: diversificationScore,
		profitLoss: ((currentValue - totalInvestment) / totalInvestment * 100).toFixed(2),
		recommendation: recommendations.length > 0 ? recommendations[0] : "Your portfolio is well-balanced.",
		allocation,
		averageVolatility: averageVolatility.toFixed(2),
		maxAllocation: maxAllocation.toFixed(1),
	};
};

// ===== CRYPTO SCAM DETECTION =====
export const detectCryptoScamRisk = (coin) => {
	const riskFactors = [];
	const riskScore = 0;

	// Check for red flags
	if (!coin.market_cap || coin.market_cap < 100000) {
		riskFactors.push("Extremely low market cap - high volatility risk");
	}

	if (coin.price_change_percentage_24h > 50 || coin.price_change_percentage_24h < -50) {
		riskFactors.push("Extreme 24h price swing - possible pump & dump");
	}

	if (!coin.total_volume || coin.total_volume < 10000) {
		riskFactors.push("Low trading volume - difficult to exit position");
	}

	if (!coin.ath || (coin.current_price / coin.ath) < 0.1) {
		riskFactors.push("Trading far below all-time high - recovery uncertain");
	}

	const volume24hMarketCapRatio = coin.total_volume / (coin.market_cap || 1);
	if (volume24hMarketCapRatio > 5) {
		riskFactors.push("Extremely high trading volume relative to market cap - suspicious activity");
	}

	let scamRiskLevel = "Low";
	if (riskFactors.length >= 3) {
		scamRiskLevel = "High ⚠️";
	} else if (riskFactors.length >= 2) {
		scamRiskLevel = "Medium";
	}

	return {
		riskLevel: scamRiskLevel,
		riskFactors: riskFactors.length > 0 ? riskFactors : ["No major red flags detected"],
		marketCap: coin.market_cap ? `$${(coin.market_cap / 1e9).toFixed(2)}B` : "N/A",
		volume24h: coin.total_volume ? `$${(coin.total_volume / 1e9).toFixed(2)}B` : "N/A",
	};
};

// ===== ENHANCED SENTIMENT ANALYSIS =====
export const getDetailedSentimentAnalysis = (coins) => {
	if (!coins.length) {
		return {
			overallSentiment: "Neutral",
			bullishCoins: 0,
			bearishCoins: 0,
			analysis: "No market data available yet.",
		};
	}

	const average24h = coins.reduce((acc, coin) => acc + (coin.price_change_percentage_24h || 0), 0) / coins.length;
	const average7d = coins.reduce((acc, coin) => acc + (coin.price_change_percentage_7d_in_currency || 0), 0) / coins.length;

	const bullishCoins = coins.filter((coin) => (coin.price_change_percentage_24h || 0) > 1).length;
	const bearishCoins = coins.filter((coin) => (coin.price_change_percentage_24h || 0) < -1).length;

	let overallSentiment = "Neutral";
	let analysisText = "";

	if (average24h > 2) {
		overallSentiment = "🚀 Very Bullish";
		analysisText = "Strong upward momentum. Market is highly optimistic.";
	} else if (average24h > 0.5) {
		overallSentiment = "📈 Bullish";
		analysisText = "Positive momentum with most coins in green.";
	} else if (average24h < -2) {
		overallSentiment = "🔴 Very Bearish";
		analysisText = "Strong downward pressure. Market is pessimistic.";
	} else if (average24h < -0.5) {
		overallSentiment = "📉 Bearish";
		analysisText = "Negative momentum with most coins in red.";
	} else {
		overallSentiment = "⚖️ Neutral";
		analysisText = "Market is indecisive. Balanced between bulls and bears.";
	}

	if (average7d > average24h) {
		analysisText += " 7-day trend is stronger than 24h - recovery in progress.";
	}

	return {
		overallSentiment,
		bullishCoins,
		bearishCoins,
		average24hChange: average24h.toFixed(2),
		average7dChange: average7d.toFixed(2),
		analysis: analysisText,
	};
};

// ===== PRICE ALERT NOTIFICATIONS =====
export const generatePriceAlerts = (coins, portfolio = {}) => {
	const alerts = [];

	coins.forEach((coin) => {
		const change = coin.price_change_percentage_24h || 0;

		// Alert for 10%+ moves
		if (Math.abs(change) >= 10) {
			const direction = change > 0 ? "📈 UP" : "📉 DOWN";
			alerts.push({
				id: `${coin.id}-price`,
				type: "price",
				coin: coin.name,
				message: `${coin.name} moved ${direction} ${Math.abs(change).toFixed(1)}% in 24h`,
				severity: Math.abs(change) > 20 ? "critical" : "warning",
			});
		}

		// Alert for portfolio holdings
		if (portfolio[coin.id]) {
			const holdingValue = portfolio[coin.id].coins * coin.current_price;
			if (change < -5) {
				alerts.push({
					id: `${coin.id}-portfolio`,
					type: "portfolio",
					coin: coin.name,
					message: `Your ${coin.name} holding down ${Math.abs(change).toFixed(1)}%`,
					severity: "warning",
				});
			}
		}
	});

	return alerts;
};