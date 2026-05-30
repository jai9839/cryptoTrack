import useBinanceTicker from "../hooks/useBinanceTicker";

const BinanceLiveCard = ({ symbol = "BTCUSDT" }) => {
	const { data, loading, error } = useBinanceTicker(symbol);

	return (
		<div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-5 text-left w-full max-w-md">
			<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
				Binance Live Market
			</h2>
			<p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
				Live price, 24h change, and exchange-price data from Binance.
			</p>
			{loading ? (
				<p className="text-sm text-gray-600 dark:text-gray-300">Loading live Binance data…</p>
			) : error ? (
				<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
			) : (
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500 dark:text-gray-400">Symbol</span>
						<span className="font-semibold text-gray-900 dark:text-white">{data.symbol}</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500 dark:text-gray-400">Last Price</span>
						<span className="font-semibold text-gray-900 dark:text-white">
							{data.lastPrice ? parseFloat(data.lastPrice).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "N/A"} USDT
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500 dark:text-gray-400">24h Change</span>
						<span className={
							`font-semibold ${parseFloat(data.priceChangePercent) >= 0 ? "text-green-600" : "text-red-600"}`
						}>
							{data.priceChangePercent ? `${parseFloat(data.priceChangePercent).toFixed(2)}%` : "N/A"}
						</span>
					</div>
					<div className="rounded-2xl bg-slate-100 dark:bg-gray-900 p-3">
						<p className="text-xs text-gray-500 dark:text-gray-400">
							Binance API: live exchange price data for trading dashboards and charting.
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default BinanceLiveCard;
