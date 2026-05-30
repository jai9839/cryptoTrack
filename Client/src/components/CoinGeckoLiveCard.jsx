const CoinGeckoLiveCard = ({ coins = [] }) => {
	const topCoin = coins[0];

	return (
		<div className="bg-white shadow-lg rounded-3xl p-6 w-full max-w-md dark:bg-gray-800">
			<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
				Live CoinGecko Market Pulse
			</h2>
			<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
				Real-time prices and momentum from CoinGecko across the most popular coins.
			</p>
			{topCoin ? (
				<div className="mt-6 rounded-3xl border border-slate-200 p-5 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Top market leader</p>
							<p className="text-xl font-bold text-gray-900 dark:text-white">{topCoin.name}</p>
						</div>
						<p className={`text-sm font-semibold ${topCoin.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-500"}`}>
							{topCoin.price_change_percentage_24h?.toFixed(2)}%
						</p>
					</div>
					<div className="mt-4 flex items-center justify-between gap-4">
						<p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
						<p className="text-lg font-semibold text-gray-900 dark:text-white">${topCoin.current_price.toLocaleString()}</p>
					</div>
				</div>
			) : (
				<p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading CoinGecko market summary...</p>
			)}
		</div>
	);
};

export default CoinGeckoLiveCard;
