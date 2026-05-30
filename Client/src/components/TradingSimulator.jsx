import { useEffect, useMemo, useState } from "react";
import { useCurrency } from "../context/CurrencyContext";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const INITIAL_BALANCE = 100000;

const TradingSimulator = ({ coins = [] }) => {
	const { formatCurrency } = useCurrency();
	const [balance, setBalance] = useState(INITIAL_BALANCE);
	const [portfolio, setPortfolio] = useState({});
	const [history, setHistory] = useState([]);
	const [selectedCoin, setSelectedCoin] = useState(coins[0]?.id || "bitcoin");
	const [amount, setAmount] = useState(0);
	const [warning, setWarning] = useState(null);
	const [leaderboard, setLeaderboard] = useState([]);
	const [username, setUsername] = useState("");
	const [showLeaderboard, setShowLeaderboard] = useState(false);

	const INITIAL_INVESTMENT = 100000;

	useEffect(() => {
		const savedBalance = localStorage.getItem("simBalance");
		const savedPortfolio = localStorage.getItem("simPortfolio");
		const savedHistory = localStorage.getItem("simHistory");
		const savedLeaderboard = localStorage.getItem("simLeaderboard");
		const savedUsername = localStorage.getItem("simUsername");

		if (savedBalance) setBalance(JSON.parse(savedBalance));
		if (savedPortfolio) setPortfolio(JSON.parse(savedPortfolio));
		if (savedHistory) setHistory(JSON.parse(savedHistory));
		if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));
		if (savedUsername) setUsername(JSON.parse(savedUsername));
	}, []);

	useEffect(() => {
		localStorage.setItem("simBalance", JSON.stringify(balance));
		localStorage.setItem("simPortfolio", JSON.stringify(portfolio));
		localStorage.setItem("simHistory", JSON.stringify(history));
		localStorage.setItem("simLeaderboard", JSON.stringify(leaderboard));
		localStorage.setItem("simUsername", JSON.stringify(username));
	}, [balance, portfolio, history, leaderboard, username]);

	const chosenCoin = useMemo(
		() => coins.find((coin) => coin.id === selectedCoin),
		[coins, selectedCoin]
	);

	const portfolioValue = Object.keys(portfolio).reduce((acc, key) => {
		const coin = coins.find((item) => item.id === key);
		const quantity = portfolio[key] || 0;
		return acc + (coin?.current_price || 0) * quantity;
	}, 0);

	const netWorth = balance + portfolioValue;
	const totalProfit = netWorth - INITIAL_INVESTMENT;
	const profitPercentage = (totalProfit / INITIAL_INVESTMENT) * 100;

	const handleBuy = () => {
		if (!chosenCoin || amount <= 0) {
			setWarning("Enter a valid amount to buy.");
			return;
		}
		const spend = amount * chosenCoin.current_price;
		if (spend > balance) {
			setWarning("Not enough virtual balance to complete this purchase.");
			return;
		}
		setBalance((prev) => prev - spend);
		setPortfolio((prev) => ({
			...prev,
			[selectedCoin]: (prev[selectedCoin] || 0) + amount,
		}));
		setHistory((prev) => [
			{ type: "BUY", coin: chosenCoin.symbol, quantity: amount, price: chosenCoin.current_price, date: new Date().toLocaleString() },
			...prev,
		]);
		setAmount(0);
		setWarning(null);
	};

	const handleSell = () => {
		if (!chosenCoin || amount <= 0) {
			setWarning("Enter a valid amount to sell.");
			return;
		}
		const own = portfolio[selectedCoin] || 0;
		if (amount > own) {
			setWarning("You don't own enough of this coin in the simulator.");
			return;
		}
		const revenue = amount * chosenCoin.current_price;
		setBalance((prev) => prev + revenue);
		setPortfolio((prev) => ({
			...prev,
			[selectedCoin]: own - amount,
		}));
		setHistory((prev) => [
			{ type: "SELL", coin: chosenCoin.symbol, quantity: amount, price: chosenCoin.current_price, date: new Date().toLocaleString() },
			...prev,
		]);
		setAmount(0);
		setWarning(null);
	};

	const handleAddToLeaderboard = () => {
		if (!username.trim()) {
			setWarning("Please enter your name for the leaderboard.");
			return;
		}

		const newEntry = {
			id: Date.now(),
			name: username,
			netWorth: netWorth,
			profit: totalProfit,
			profitPercentage: profitPercentage,
			timestamp: new Date().toLocaleString(),
			tradesCount: history.length,
		};

		const updatedLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.netWorth - a.netWorth);
		setLeaderboard(updatedLeaderboard);
		setWarning(null);
	};

	const handleReset = () => {
		if (window.confirm("Are you sure you want to reset your simulator? This will clear all trades and balance.")) {
			setBalance(INITIAL_BALANCE);
			setPortfolio({});
			setHistory([]);
			setAmount(0);
			setWarning(null);
		}
	};

	return (
		<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						💰 Fake Trading Simulator
					</h2>
					<p className="mt-2 text-gray-500 dark:text-gray-400">
						Practice trading with virtual ₹1,00,000. Compete on the leaderboard!
					</p>
				</div>
				<div className="flex gap-2 flex-wrap">
					<button
						onClick={() => setShowLeaderboard(!showLeaderboard)}
						className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
					>
						🏆 Leaderboard
					</button>
					<button
						onClick={handleReset}
						className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
					>
						🔄 Reset
					</button>
				</div>
			</div>

			{/* Performance Summary */}
			<div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
				<div className="bg-slate-100 dark:bg-gray-900 rounded-2xl p-4">
					<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cash</p>
					<p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(balance)}</p>
				</div>
				<div className="bg-slate-100 dark:bg-gray-900 rounded-2xl p-4">
					<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Portfolio Value</p>
					<p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(portfolioValue)}</p>
				</div>
				<div className="bg-slate-100 dark:bg-gray-900 rounded-2xl p-4">
					<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Net Worth</p>
					<p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(netWorth)}</p>
				</div>
				<div className={`bg-slate-100 dark:bg-gray-900 rounded-2xl p-4 ${totalProfit >= 0 ? "border-2 border-green-500" : "border-2 border-red-500"}`}>
					<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Profit/Loss</p>
					<div className="flex items-center gap-2 mt-1">
						{totalProfit >= 0 ? <TrendingUpIcon className="text-green-600" /> : <TrendingDownIcon className="text-red-600" />}
						<p className={`text-xl font-bold ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
							{totalProfit >= 0 ? "+" : ""}{formatCurrency(totalProfit)} ({profitPercentage.toFixed(2)}%)
						</p>
					</div>
				</div>
			</div>

			{/* Main Trading Section */}
			<div className="mt-6 grid gap-6 lg:grid-cols-2">
				{/* Trading Panel */}
				<div className="rounded-3xl border border-slate-200 p-6 dark:border-gray-700">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Buy / Sell</h3>
					<div className="flex flex-col gap-4">
						<select
							value={selectedCoin}
							onChange={(e) => setSelectedCoin(e.target.value)}
							className="rounded-2xl border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							{coins.map((coin) => (
								<option key={coin.id} value={coin.id}>
									{coin.name} ({coin.symbol.toUpperCase()}) - ${coin.current_price?.toFixed(2)}
								</option>
							))}
						</select>

						{chosenCoin && (
							<div className="bg-blue-50 dark:bg-blue-900 rounded-2xl p-3 text-sm">
								<p className="text-gray-700 dark:text-gray-300">
									Current Price: <strong>{formatCurrency(chosenCoin.current_price)}</strong>
								</p>
								<p className={`text-sm mt-1 font-semibold ${chosenCoin.price_change_percentage_24h >= 0 ? "text-green-600" : "text-red-600"}`}>
									24h Change: {chosenCoin.price_change_percentage_24h >= 0 ? "+" : ""}{chosenCoin.price_change_percentage_24h?.toFixed(2)}%
								</p>
							</div>
						)}

						<div>
							<label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</label>
							<input
								type="number"
								step="0.01"
								value={amount}
								onChange={(e) => setAmount(Number(e.target.value))}
								placeholder="Enter quantity"
								className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							{chosenCoin && amount > 0 && (
								<p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
									Total: {formatCurrency(amount * chosenCoin.current_price)}
								</p>
							)}
						</div>

						<div className="flex gap-3">
							<button
								onClick={handleBuy}
								className="flex-1 rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-all"
							>
								✅ Buy
							</button>
							<button
								onClick={handleSell}
								className="flex-1 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-all"
							>
								❌ Sell
							</button>
						</div>

						{warning && (
							<div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 rounded-2xl p-3">
								<p className="text-sm text-red-700 dark:text-red-200">{warning}</p>
							</div>
						)}
					</div>
				</div>

				{/* Portfolio */}
				<div className="rounded-3xl border border-slate-200 p-6 dark:border-gray-700">
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Holdings</h3>
					<div className="space-y-3 max-h-96 overflow-y-auto">
						{Object.keys(portfolio).length === 0 ? (
							<p className="text-gray-500 dark:text-gray-400 text-center py-8">No holdings yet. Start trading!</p>
						) : (
							Object.entries(portfolio).map(([coinId, qty]) => {
								const coin = coins.find((item) => item.id === coinId);
								const holdingValue = qty * (coin?.current_price || 0);
								return (
									<div key={coinId} className="rounded-2xl border border-slate-200 p-4 dark:border-gray-700">
										<div className="flex items-center justify-between">
											<div>
												<p className="font-semibold text-gray-900 dark:text-white">{coin?.name}</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{qty.toFixed(4)} {coin?.symbol.toUpperCase()}
												</p>
											</div>
											<p className="font-bold text-gray-900 dark:text-white text-right">
												{formatCurrency(holdingValue)}
											</p>
										</div>
									</div>
								);
							})
						)}
					</div>
				</div>
			</div>

			{/* Leaderboard Section */}
			{showLeaderboard && (
				<div className="mt-6 rounded-3xl border border-slate-200 p-6 dark:border-gray-700">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white">🏆 Global Leaderboard</h3>
						<div className="flex gap-2">
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								placeholder="Your name"
								className="rounded-2xl border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<button
								onClick={handleAddToLeaderboard}
								className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
							>
								📝 Submit
							</button>
						</div>
					</div>

					{leaderboard.length === 0 ? (
						<p className="text-center text-gray-500 dark:text-gray-400 py-8">Be the first to join the leaderboard!</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead className="border-b-2 border-gray-300 dark:border-gray-600">
									<tr>
										<th className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">#</th>
										<th className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">Player</th>
										<th className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">Net Worth</th>
										<th className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">Profit</th>
										<th className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">Trades</th>
									</tr>
								</thead>
								<tbody>
									{leaderboard.slice(0, 10).map((entry, idx) => (
										<tr key={entry.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
											<td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
												{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
											</td>
											<td className="px-4 py-3 text-gray-900 dark:text-white font-semibold">{entry.name}</td>
											<td className="px-4 py-3 text-gray-900 dark:text-white font-bold">{formatCurrency(entry.netWorth)}</td>
											<td className={`px-4 py-3 font-bold ${entry.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
												{entry.profit >= 0 ? "+" : ""}{formatCurrency(entry.profit)} ({entry.profitPercentage.toFixed(1)}%)
											</td>
											<td className="px-4 py-3 text-gray-700 dark:text-gray-300">{entry.tradesCount}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			{/* Trade History */}
			<div className="mt-6 rounded-3xl border border-slate-200 p-6 dark:border-gray-700">
				<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Trade History</h3>
				<div className="space-y-2 max-h-64 overflow-y-auto">
					{history.length === 0 ? (
						<p className="text-gray-500 dark:text-gray-400 text-center py-8">No trades yet.</p>
					) : (
						history.map((event, index) => (
							<div key={index} className={`rounded-2xl p-3 flex items-center justify-between ${event.type === "BUY" ? "bg-green-50 dark:bg-green-900" : "bg-red-50 dark:bg-red-900"}`}>
								<div>
									<p className={`text-sm font-bold ${event.type === "BUY" ? "text-green-700 dark:text-green-200" : "text-red-700 dark:text-red-200"}`}>
										{event.type === "BUY" ? "📈 BUY" : "📉 SELL"} {event.coin.toUpperCase()}
									</p>
									<p className="text-xs text-gray-600 dark:text-gray-300">{event.date}</p>
								</div>
								<div className="text-right">
									<p className="text-sm font-bold text-gray-900 dark:text-white">{event.quantity.toFixed(4)} coins</p>
									<p className="text-xs text-gray-600 dark:text-gray-300">{formatCurrency(event.price * event.quantity)}</p>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default TradingSimulator;
