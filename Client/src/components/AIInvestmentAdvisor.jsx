import { getPortfolioAnalysis, getAIRecommendations } from "../utils/aiUtils";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const AIInvestmentAdvisor = ({ portfolio = {}, coins = [] }) => {
	const analysis = getPortfolioAnalysis(portfolio, coins);

	const getRiskColor = (riskLevel) => {
		switch (riskLevel) {
			case "Low":
				return "text-green-600";
			case "Medium":
				return "text-yellow-600";
			case "High":
				return "text-red-600";
			default:
				return "text-gray-600";
		}
	};

	const getRiskBgColor = (riskLevel) => {
		switch (riskLevel) {
			case "Low":
				return "bg-green-100 dark:bg-green-900";
			case "Medium":
				return "bg-yellow-100 dark:bg-yellow-900";
			case "High":
				return "bg-red-100 dark:bg-red-900";
			default:
				return "bg-gray-100 dark:bg-gray-900";
		}
	};

	return (
		<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
			<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
				🤖 AI Investment Advisor
			</h2>

			{Object.keys(portfolio).length === 0 ? (
				<div className="text-center py-8">
					<p className="text-gray-500 dark:text-gray-400">
						Add coins to your portfolio to unlock personalized AI investment analysis.
					</p>
				</div>
			) : (
				<div className="space-y-6">
					{/* Risk Assessment */}
					<div className={`rounded-2xl p-6 ${getRiskBgColor(analysis.riskLevel)}`}>
						<div className="flex items-center justify-between mb-4">
							<h3 className={`text-lg font-semibold ${getRiskColor(analysis.riskLevel)}`}>
								Portfolio Risk Level
							</h3>
							<span className={`text-3xl font-bold ${getRiskColor(analysis.riskLevel)}`}>
								{analysis.riskLevel}
							</span>
						</div>
						<p className="text-sm text-gray-700 dark:text-gray-300">
							Based on volatility analysis and asset concentration
						</p>
					</div>

					{/* Key Metrics */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div className="bg-slate-100 dark:bg-gray-900 rounded-2xl p-4">
							<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
								Diversification
							</p>
							<p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
								{analysis.diversification}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								{Object.keys(portfolio).length} coins held
							</p>
						</div>
						<div className="bg-slate-100 dark:bg-gray-900 rounded-2xl p-4">
							<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
								Profit/Loss
							</p>
							<div className="flex items-center gap-2 mt-2">
								{analysis.profitLoss >= 0 ? (
									<TrendingUpIcon className="text-green-600" />
								) : (
									<TrendingDownIcon className="text-red-600" />
								)}
								<p className={`text-xl font-bold ${analysis.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
									{analysis.profitLoss}%
								</p>
							</div>
						</div>
						<div className="bg-slate-100 dark:bg-gray-900 rounded-2xl p-4">
							<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
								Volatility
							</p>
							<p className="text-xl font-bold text-gray-900 dark:text-white mt-2">
								{analysis.averageVolatility}%
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								Avg 24h change
							</p>
						</div>
					</div>

					{/* Recommendation */}
					<div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
						<p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
							💡 Advisor Recommendation:
						</p>
						<p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
							{analysis.recommendation}
						</p>
					</div>

					{/* Asset Allocation */}
					<div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							Portfolio Allocation
						</h3>
						<div className="space-y-3">
							{analysis.allocation.map((asset) => (
								<div key={asset.symbol} className="flex items-center justify-between">
									<div className="flex items-center gap-3 flex-1">
										<div>
											<p className="font-semibold text-gray-900 dark:text-white">
												{asset.name}
											</p>
											<p className="text-xs text-gray-500 dark:text-gray-400">
												{asset.symbol}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="font-bold text-gray-900 dark:text-white">
											{asset.percentage}%
										</p>
										<p className={`text-xs font-semibold ${asset.change >= 0 ? "text-green-600" : "text-red-600"}`}>
											{asset.change >= 0 ? "+" : ""}{asset.change.toFixed(1)}%
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Percentage Bar */}
					<div className="mt-4">
						<div className="flex h-6 rounded-full overflow-hidden gap-1 bg-gray-200 dark:bg-gray-700">
							{analysis.allocation.map((asset, idx) => {
								const colors = [
									"bg-blue-500",
									"bg-green-500",
									"bg-yellow-500",
									"bg-red-500",
									"bg-purple-500",
									"bg-pink-500",
									"bg-indigo-500",
									"bg-teal-500",
								];
								return (
									<div
										key={asset.symbol}
										className={colors[idx % colors.length]}
										style={{ width: `${asset.percentage}%` }}
										title={`${asset.name}: ${asset.percentage}%`}
									/>
								);
							})}
						</div>
						<div className="flex flex-wrap gap-2 mt-3 text-xs">
							{analysis.allocation.map((asset, idx) => {
								const colors = [
									"bg-blue-100 dark:bg-blue-900",
									"bg-green-100 dark:bg-green-900",
									"bg-yellow-100 dark:bg-yellow-900",
									"bg-red-100 dark:bg-red-900",
									"bg-purple-100 dark:bg-purple-900",
									"bg-pink-100 dark:bg-pink-900",
									"bg-indigo-100 dark:bg-indigo-900",
									"bg-teal-100 dark:bg-teal-900",
								];
								return (
									<span
										key={asset.symbol}
										className={`px-2 py-1 rounded ${colors[idx % colors.length]}`}
									>
										{asset.symbol}: {asset.percentage}%
									</span>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AIInvestmentAdvisor;
