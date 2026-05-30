import { useState } from "react";
import { getAIChatResponse, getAIInsights, getPortfolioAnalysis } from "../utils/aiUtils";
import SendIcon from "@mui/icons-material/Send";

const DashboardAIChat = ({ coins = [], portfolio = {} }) => {
	const [query, setQuery] = useState("");
	const [messages, setMessages] = useState([
		{
			from: "ai",
			text: "👋 Hi! I'm your AI assistant. Ask me about your portfolio, market trends, or crypto strategies. Try: 'Analyze my portfolio', 'Best coin today', or 'Should I diversify?'",
		},
	]);
	const [loading, setLoading] = useState(false);

	const handleAsk = async (text) => {
		if (!text.trim()) return;

		// Add user message
		setMessages((prev) => [...prev, { from: "user", text }]);
		setLoading(true);

		// Simulate AI thinking
		setTimeout(() => {
			let answer = getAIChatResponse(text, coins, portfolio);

			// Special responses
			const normalized = text.toLowerCase();
			if (normalized.includes("portfolio") || normalized.includes("my holdings")) {
				const analysis = getPortfolioAnalysis(portfolio, coins);
				if (analysis.riskLevel !== "No Data") {
					answer = `Your portfolio risk level is ${analysis.riskLevel}. You're holding ${Object.keys(portfolio).length} different coins with ${analysis.diversification} diversification. ${analysis.recommendation}`;
				}
			} else if (normalized.includes("insights") || normalized.includes("tell me")) {
				answer = getAIInsights(portfolio, coins);
			} else if (normalized.includes("diversify")) {
				const analysis = getPortfolioAnalysis(portfolio, coins);
				answer = analysis.maxAllocation > 50
					? `Your largest position is ${analysis.maxAllocation}% of your portfolio - that's quite concentrated. Consider diversifying into 3-5 different coins to reduce risk.`
					: `Your portfolio seems reasonably diversified with ${Object.keys(portfolio).length} coins. Keep monitoring and rebalance quarterly.`;
			} else if (normalized.includes("best coin") || normalized.includes("strong")) {
				const topGainer = coins.reduce((best, coin) => {
					if (!best) return coin;
					return (coin.price_change_percentage_24h || 0) > (best.price_change_percentage_24h || 0)
						? coin
						: best;
				}, null);
				answer = topGainer
					? `${topGainer.name} is leading with a ${topGainer.price_change_percentage_24h?.toFixed(1)}% gain today. Always research before investing.`
					: answer;
			}

			setMessages((prev) => [
				...prev,
				{ from: "ai", text: answer },
			]);
			setLoading(false);
		}, 800);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!query.trim() || loading) return;
		handleAsk(query.trim());
		setQuery("");
	};

	const quickAsks = [
		"Analyze my portfolio",
		"Best coin today",
		"Risk analysis",
		"Should I diversify?",
	];

	return (
		<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
			<h2 className="text-xl font-bold text-gray-900 dark:text-white">
				🤖 AI Chat Assistant
			</h2>
			<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
				Ask about your portfolio, market trends, and crypto strategies
			</p>

			{/* Chat messages */}
			<div className="space-y-4 max-h-96 overflow-y-auto mb-6 p-4 bg-slate-50 dark:bg-gray-900 rounded-2xl mt-4">
				{messages.map((message, index) => (
					<div
						key={index}
						className={`rounded-2xl p-4 ${
							message.from === "ai"
								? "bg-slate-200 text-slate-900 dark:bg-gray-700 dark:text-white"
								: "bg-blue-500 text-white ml-auto max-w-xs"
						}`}
					>
						<p className="text-xs uppercase tracking-wider font-semibold mb-1">
							{message.from === "ai" ? "🤖 AI Assistant" : "👤 You"}
						</p>
						<p className="text-sm leading-relaxed">{message.text}</p>
					</div>
				))}
				{loading && (
					<div className="rounded-2xl p-4 bg-slate-200 text-slate-900 dark:bg-gray-700 dark:text-white">
						<p className="text-xs uppercase tracking-wider font-semibold mb-2">
							🤖 AI Assistant
						</p>
						<div className="flex gap-2">
							<div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
							<div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
							<div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
						</div>
					</div>
				)}
			</div>

			{/* Quick asks */}
			{messages.length <= 1 && (
				<div className="mb-4">
					<p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
						Quick Questions:
					</p>
					<div className="flex flex-wrap gap-2">
						{quickAsks.map((ask) => (
							<button
								key={ask}
								onClick={() => handleAsk(ask)}
								disabled={loading}
								className="text-xs px-3 py-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
							>
								{ask}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Input */}
			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="Ask about portfolio, prices, strategies..."
					disabled={loading}
					className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
				/>
				<button
					type="submit"
					disabled={loading || !query.trim()}
					className="px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
				>
					<SendIcon className="w-5 h-5" />
				</button>
			</form>
		</div>
	);
};

export default DashboardAIChat;
