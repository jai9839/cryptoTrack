import { getDetailedSentimentAnalysis } from "../utils/aiUtils";

const AIMarketSentimentAnalyzer = ({ coins = [] }) => {
	const analysis = getDetailedSentimentAnalysis(coins);

	const getSentimentColor = (sentiment) => {
		if (sentiment.includes("Very Bullish")) {
			return "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700";
		}
		if (sentiment.includes("Bullish")) {
			return "bg-lime-100 dark:bg-lime-900 border-lime-300 dark:border-lime-700";
		}
		if (sentiment.includes("Very Bearish")) {
			return "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700";
		}
		if (sentiment.includes("Bearish")) {
			return "bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700";
		}
		return "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700";
	};

	const getSentimentIcon = (sentiment) => {
		if (sentiment.includes("Very Bullish")) return "🚀";
		if (sentiment.includes("Bullish")) return "📈";
		if (sentiment.includes("Very Bearish")) return "🔴";
		if (sentiment.includes("Bearish")) return "📉";
		return "⚖️";
	};

	return (
		<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
				📊 AI Market Sentiment Analyzer
			</h2>

			{coins.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-gray-500 dark:text-gray-400">
						No market data available. Please check back soon.
					</p>
				</div>
			) : (
				<div className="space-y-6">
					{/* Main Sentiment Card */}
					<div className={`border-2 rounded-2xl p-8 text-center ${getSentimentColor(analysis.overallSentiment)}`}>
						<p className="text-6xl mb-4">{getSentimentIcon(analysis.overallSentiment)}</p>
						<p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
							{analysis.overallSentiment}
						</p>
						<p className="text-lg text-gray-700 dark:text-gray-200">
							{analysis.analysis}
						</p>
					</div>

					{/* Statistics */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						<div className="bg-slate-100 dark:bg-gray-900 rounded-2xl p-4 text-center">
							<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
								Bullish Coins
							</p>
							<p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
								{analysis.bullishCoins}
							</p>
							<p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
								{coins.length > 0
									? ((analysis.bullishCoins / coins.length) * 100).toFixed(1)
									: 0}
								%
							</p>
						</div>

						<div className="bg-slate-100 dark:bg-gray-900 rounded-2xl p-4 text-center">
							<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
								Bearish Coins
							</p>
							<p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
								{analysis.bearishCoins}
							</p>
							<p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
								{coins.length > 0
									? ((analysis.bearishCoins / coins.length) * 100).toFixed(1)
									: 0}
								%
							</p>
						</div>

						<div className="bg-slate-100 dark:bg-gray-900 rounded-2xl p-4 text-center">
							<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
								24h Avg Change
							</p>
							<p className={`text-2xl font-bold mt-2 ${parseFloat(analysis.average24hChange) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
								{parseFloat(analysis.average24hChange) >= 0 ? "+" : ""}
								{analysis.average24hChange}%
							</p>
						</div>

						<div className="bg-slate-100 dark:bg-gray-900 rounded-2xl p-4 text-center">
							<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
								7d Avg Change
							</p>
							<p className={`text-2xl font-bold mt-2 ${parseFloat(analysis.average7dChange) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
								{parseFloat(analysis.average7dChange) >= 0 ? "+" : ""}
								{analysis.average7dChange}%
							</p>
						</div>
					</div>

					{/* Sentiment Gauge */}
					<div>
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
							Market Sentiment Gauge
						</p>
						<div className="flex items-center gap-2">
							<span className="text-xs font-semibold text-red-600">Bearish</span>
							<div className="flex-1 h-8 bg-gradient-to-r from-red-500 via-gray-300 to-green-500 rounded-full overflow-hidden">
								<div
									className="h-full bg-black opacity-30 transition-all"
									style={{
										width: `${50 + (parseFloat(analysis.average24hChange) * 2.5)}%`,
										maxWidth: "100%",
										minWidth: "20px",
									}}
								/>
							</div>
							<span className="text-xs font-semibold text-green-600">Bullish</span>
						</div>
						<p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
							Market is {parseFloat(analysis.average24hChange) > 0 ? "leaning bullish" : "leaning bearish"} based on 24h momentum
						</p>
					</div>

					{/* Detailed Insights */}
					<div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 rounded-lg p-4">
						<p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
							💡 AI Insight
						</p>
						<p className="text-sm text-blue-800 dark:text-blue-200">
							{analysis.bullishCoins > coins.length / 2
								? "More than 50% of coins are in green. Consider looking for entry points in underperforming assets."
								: analysis.bearishCoins > coins.length / 2
								? "More than 50% of coins are in red. Exercise caution and maintain defensive positions."
								: "The market is split between buyers and sellers. This could be a good time for selective buying or profit-taking."}
						</p>
					</div>

					{/* Historical Context */}
					<div className="border border-gray-300 dark:border-gray-600 rounded-2xl p-4">
						<p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
							📈 7-Day Trend
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
							<strong>24h Average:</strong> {parseFloat(analysis.average24hChange) >= 0 ? "↗️" : "↘️"} {analysis.average24hChange}%
						</p>
						<p className="text-sm text-gray-600 dark:text-gray-300">
							<strong>7d Average:</strong> {parseFloat(analysis.average7dChange) >= 0 ? "↗️" : "↘️"} {analysis.average7dChange}%
						</p>
						{parseFloat(analysis.average7dChange) > parseFloat(analysis.average24hChange) ? (
							<p className="text-sm text-green-600 dark:text-green-400 mt-2 font-semibold">
								✅ 7-day trend is stronger - potential recovery in progress
							</p>
						) : (
							<p className="text-sm text-orange-600 dark:text-orange-400 mt-2 font-semibold">
								⚠️ 24h momentum weaker than 7-day trend - watch for consolidation
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default AIMarketSentimentAnalyzer;
