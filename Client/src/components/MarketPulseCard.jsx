import { getAIMarketSentiment } from "../utils/aiUtils";

const MarketPulseCard = ({ coins }) => {
	const sentiment = getAIMarketSentiment(coins);
	const gainers = coins
		.slice()
		.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
		.slice(0, 3);
	const losers = coins
		.slice()
		.sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0))
		.slice(0, 3);

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
				<h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
					Market Pulse
				</h2>
				<p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
					{sentiment}
				</p>
				<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
					Live coin momentum and sentiment across your top tracked markets.
				</p>
			</div>
			<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
				<h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
					Top 3 Gainers
				</h3>
				<div className="mt-4 space-y-3">
					{gainers.map((coin) => (
						<div key={coin.id} className="rounded-3xl border border-slate-200 p-4 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<span className="font-semibold text-gray-900 dark:text-white">{coin.symbol.toUpperCase()}</span>
								<span className="text-sm text-green-600">+{coin.price_change_percentage_24h?.toFixed(1)}%</span>
							</div>
							<p className="text-sm text-gray-500 dark:text-gray-400">{coin.name}</p>
						</div>
					))}
				</div>
			</div>
			<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
				<h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">
					Top 3 Losers
				</h3>
				<div className="mt-4 space-y-3">
					{losers.map((coin) => (
						<div key={coin.id} className="rounded-3xl border border-slate-200 p-4 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<span className="font-semibold text-gray-900 dark:text-white">{coin.symbol.toUpperCase()}</span>
								<span className="text-sm text-red-600">{coin.price_change_percentage_24h?.toFixed(1)}%</span>
							</div>
							<p className="text-sm text-gray-500 dark:text-gray-400">{coin.name}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default MarketPulseCard;
