import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	LineChart,
	Line,
	Legend,
	ComposedChart,
} from "recharts";

const TransactionVisualizer = ({ coins = [] }) => {
	const chartData = coins.slice(0, 12).map((coin) => ({
		name: coin.symbol.toUpperCase(),
		price: coin.current_price || 0,
		volume: (coin.total_volume || 0) / 1e9, // Convert to billions
		change: coin.price_change_percentage_24h || 0,
		marketCap: (coin.market_cap || 0) / 1e9, // Convert to billions
	}));

	const volumeBySize = coins
		.filter((c) => c.total_volume)
		.sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0))
		.slice(0, 8)
		.map((coin) => ({
			name: coin.symbol.toUpperCase(),
			volume: (coin.total_volume || 0) / 1e9,
		}));

	const topCoinsData = coins
		.slice()
		.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
		.slice(0, 8)
		.map((coin) => ({
			name: coin.symbol.toUpperCase(),
			marketCap: (coin.market_cap || 0) / 1e9,
			change: coin.price_change_percentage_24h || 0,
		}));

	return (
		<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					⛓️ Blockchain Transaction & Market Visualizer
				</h2>
				<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
					Visual analysis of trading volume, price movements, and market cap across top cryptocurrencies
				</p>
			</div>

			{/* Price vs Volume Chart */}
			<div className="mb-8">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					📊 Volume & Price Overview
				</h3>
				<div className="h-80 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
					<ResponsiveContainer width="100%" height="100%">
						<ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis
								dataKey="name"
								angle={-45}
								textAnchor="end"
								height={80}
								stroke="#94a3b8"
							/>
							<YAxis
								yAxisId="left"
								stroke="#94a3b8"
								label={{ value: "Volume (B USD)", angle: -90, position: "insideLeft" }}
							/>
							<YAxis
								yAxisId="right"
								orientation="right"
								stroke="#94a3b8"
								label={{ value: "Change (%)", angle: 90, position: "insideRight" }}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#1f2937",
									border: "1px solid #374151",
									borderRadius: "12px",
									color: "#f3f4f6",
								}}
								formatter={(value) => value.toFixed(2)}
							/>
							<Legend />
							<Bar yAxisId="left" dataKey="volume" fill="#2563eb" radius={[8, 8, 0, 0]} name="Volume (B)" />
							<Line
								yAxisId="right"
								type="monotone"
								dataKey="change"
								stroke="#10b981"
								strokeWidth={2}
								name="24h Change %"
								dot={{ fill: "#10b981", r: 4 }}
							/>
						</ComposedChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Top Coins by Volume */}
			<div className="mb-8">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					💰 Top Trading Volume (24h)
				</h3>
				<div className="h-80 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={volumeBySize} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 10 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis type="number" stroke="#94a3b8" />
							<YAxis dataKey="name" type="category" stroke="#94a3b8" />
							<Tooltip
								contentStyle={{
									backgroundColor: "#1f2937",
									border: "1px solid #374151",
									borderRadius: "12px",
									color: "#f3f4f6",
								}}
								formatter={(value) => `$${value.toFixed(2)}B`}
							/>
							<Bar dataKey="volume" fill="#8b5cf6" radius={[0, 8, 8, 0]} name="24h Volume (B)" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Market Cap Dominance */}
			<div className="mb-8">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					🏆 Market Cap Dominance
				</h3>
				<div className="h-80 bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={topCoinsData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis
								dataKey="name"
								angle={-45}
								textAnchor="end"
								height={80}
								stroke="#94a3b8"
							/>
							<YAxis
								stroke="#94a3b8"
								label={{ value: "Market Cap (B USD)", angle: -90, position: "insideLeft" }}
							/>
							<Tooltip
								contentStyle={{
									backgroundColor: "#1f2937",
									border: "1px solid #374151",
									borderRadius: "12px",
									color: "#f3f4f6",
								}}
								formatter={(value) => `$${value.toFixed(2)}B`}
							/>
							<Bar dataKey="marketCap" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Market Cap (B)" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Summary Stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-2xl p-6 border border-blue-300 dark:border-blue-700">
					<p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
						Total Market Volume (24h)
					</p>
					<p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-2">
						${(coins.reduce((sum, c) => sum + (c.total_volume || 0), 0) / 1e9).toFixed(2)}B
					</p>
				</div>

				<div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-2xl p-6 border border-purple-300 dark:border-purple-700">
					<p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
						Total Market Cap
					</p>
					<p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-2">
						${(coins.reduce((sum, c) => sum + (c.market_cap || 0), 0) / 1e9).toFixed(2)}B
					</p>
				</div>
			</div>

			{/* Transaction Insights */}
			<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 rounded-lg">
				<p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
					📈 Market Insights
				</p>
				<ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
					<li>
						✓ Highest volume coin:{" "}
						<strong>
							{volumeBySize[0]?.name} (${volumeBySize[0]?.volume.toFixed(2)}B)
						</strong>
					</li>
					<li>
						✓ Largest market cap:{" "}
						<strong>
							{topCoinsData[0]?.name} (${topCoinsData[0]?.marketCap.toFixed(2)}B)
						</strong>
					</li>
					<li>
						✓ Charts update with real-time market data from CoinGecko API
					</li>
					<li>
						✓ Use this data to identify market trends and trading opportunities
					</li>
				</ul>
			</div>
		</div>
	);
};

export default TransactionVisualizer;
