const Heatmap = ({ coins = [] }) => {
	const getHeatmapColor = (change) => {
		const intensity = Math.min(Math.abs(change) / 15, 1);
		if (change >= 0) {
			return {
				background: `rgba(16, 185, 129, ${0.1 + intensity * 0.8})`,
				text: `rgba(4, 120, 87, ${0.8 + intensity * 0.2})`,
				border: `rgba(6, 95, 70, ${0.3 + intensity * 0.5})`,
			};
		} else {
			return {
				background: `rgba(239, 68, 68, ${0.1 + intensity * 0.8})`,
				text: `rgba(153, 27, 27, ${0.8 + intensity * 0.2})`,
				border: `rgba(127, 29, 29, ${0.3 + intensity * 0.5})`,
			};
		}
	};

	const sortedCoins = coins
		.slice()
		.sort((a, b) => Math.abs((b.price_change_percentage_24h || 0)) - Math.abs((a.price_change_percentage_24h || 0)))
		.slice(0, 24);

	if (sortedCoins.length === 0) {
		return (
			<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
				<h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
					📊 Live Crypto Heatmap
				</h2>
				<p className="text-gray-500 dark:text-gray-400">
					No market data available yet.
				</p>
			</div>
		);
	}

	return (
		<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-xl font-semibold text-gray-800 dark:text-white">
						🔥 Live Crypto Heatmap
					</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
						Green = rising coins, Red = falling coins. Based on 24h movement intensity.
					</p>
				</div>
			</div>

			{/* Heatmap Grid */}
			<div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
				{sortedCoins.map((coin) => {
					const change = coin.price_change_percentage_24h || 0;
					const colors = getHeatmapColor(change);

					return (
						<div
							key={coin.id}
							className="rounded-xl p-3 border-2 transition-transform hover:scale-105 hover:shadow-lg cursor-pointer"
							style={{
								background: colors.background,
								borderColor: colors.border,
								color: colors.text,
							}}
							title={`${coin.name}: ${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}
						>
							<p className="text-xs font-bold uppercase text-center">
								{coin.symbol.toUpperCase()}
							</p>
							<p className="text-sm font-bold text-center mt-1">
								{change >= 0 ? "📈" : "📉"}
							</p>
							<p className="text-xs font-bold text-center">
								{change >= 0 ? "+" : ""}{change.toFixed(1)}%
							</p>
						</div>
					);
				})}
			</div>

			{/* Legend & Info */}
			<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
				<div>
					<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
						Strongest Gainer
					</p>
					<p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
						{sortedCoins[0]?.name} (
						{(sortedCoins[0]?.price_change_percentage_24h || 0) >= 0
							? "+"
							: ""}
						{(sortedCoins[0]?.price_change_percentage_24h || 0).toFixed(2)}%)
					</p>
				</div>
				<div>
					<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
						Biggest Loser
					</p>
					<p className="text-sm font-bold text-red-600 dark:text-red-400 mt-1">
						{sortedCoins[sortedCoins.length - 1]?.name} (
						{(sortedCoins[sortedCoins.length - 1]?.price_change_percentage_24h || 0).toFixed(2)}%)
					</p>
				</div>
				<div>
					<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
						Avg Change
					</p>
					<p className={`text-sm font-bold mt-1 ${(sortedCoins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / sortedCoins.length) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
						{((sortedCoins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / sortedCoins.length) >= 0 ? "+" : "")}
						{(sortedCoins.reduce((sum, c) => sum + (c.price_change_percentage_24h || 0), 0) / sortedCoins.length).toFixed(2)}%
					</p>
				</div>
			</div>

			{/* Color Legend */}
			<div className="mt-4 flex items-center justify-center gap-6 text-xs">
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 rounded" style={{ background: "rgba(16, 185, 129, 0.9)" }} />
					<span className="text-gray-600 dark:text-gray-300">Strong Gain</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 rounded" style={{ background: "rgba(16, 185, 129, 0.4)" }} />
					<span className="text-gray-600 dark:text-gray-300">Slight Gain</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 rounded" style={{ background: "rgba(239, 68, 68, 0.4)" }} />
					<span className="text-gray-600 dark:text-gray-300">Slight Loss</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="w-4 h-4 rounded" style={{ background: "rgba(239, 68, 68, 0.9)" }} />
					<span className="text-gray-600 dark:text-gray-300">Strong Loss</span>
				</div>
			</div>
		</div>
	);
};

export default Heatmap;
