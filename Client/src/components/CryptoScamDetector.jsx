import { detectCryptoScamRisk } from "../utils/aiUtils";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const CryptoScamDetector = ({ coins = [] }) => {
	const getSuspiciousCoins = () => {
		return coins
			.map((coin) => ({
				...coin,
				scamAnalysis: detectCryptoScamRisk(coin),
			}))
			.sort((a, b) => {
				const riskOrder = { "High ⚠️": 3, Medium: 2, Low: 1 };
				return (riskOrder[b.scamAnalysis.riskLevel] || 0) - (riskOrder[a.scamAnalysis.riskLevel] || 0);
			});
	};

	const coins_with_analysis = getSuspiciousCoins();
	const highRiskCoins = coins_with_analysis.filter((c) => c.scamAnalysis.riskLevel === "High ⚠️");
	const mediumRiskCoins = coins_with_analysis.filter((c) => c.scamAnalysis.riskLevel === "Medium");

	const getRiskBg = (riskLevel) => {
		switch (riskLevel) {
			case "High ⚠️":
				return "bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-700";
			case "Medium":
				return "bg-yellow-50 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700";
			case "Low":
				return "bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-700";
			default:
				return "bg-gray-50 dark:bg-gray-900";
		}
	};

	const getRiskIcon = (riskLevel) => {
		return riskLevel === "High ⚠️" ? (
			<WarningIcon className="text-red-600" />
		) : riskLevel === "Medium" ? (
			<WarningIcon className="text-yellow-600" />
		) : (
			<CheckCircleIcon className="text-green-600" />
		);
	};

	return (
		<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						🚨 Crypto Scam & Risk Detector
					</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
						AI-powered analysis to identify suspicious cryptocurrencies
					</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
				<div className="bg-red-100 dark:bg-red-900 rounded-2xl p-4 border border-red-300 dark:border-red-700">
					<p className="text-sm font-semibold text-red-900 dark:text-red-100">High Risk</p>
					<p className="text-3xl font-bold text-red-600 dark:text-red-200 mt-2">{highRiskCoins.length}</p>
					<p className="text-xs text-red-700 dark:text-red-300 mt-1">Suspicious activity detected</p>
				</div>
				<div className="bg-yellow-100 dark:bg-yellow-900 rounded-2xl p-4 border border-yellow-300 dark:border-yellow-700">
					<p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Medium Risk</p>
					<p className="text-3xl font-bold text-yellow-600 dark:text-yellow-200 mt-2">{mediumRiskCoins.length}</p>
					<p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Use caution</p>
				</div>
				<div className="bg-green-100 dark:bg-green-900 rounded-2xl p-4 border border-green-300 dark:border-green-700">
					<p className="text-sm font-semibold text-green-900 dark:text-green-100">Safe</p>
					<p className="text-3xl font-bold text-green-600 dark:text-green-200 mt-2">
						{coins_with_analysis.filter((c) => c.scamAnalysis.riskLevel === "Low").length}
					</p>
					<p className="text-xs text-green-700 dark:text-green-300 mt-1">Established coins</p>
				</div>
			</div>

			{/* Coin Analysis */}
			<div className="space-y-4">
				{coins_with_analysis.length === 0 ? (
					<p className="text-center text-gray-500 dark:text-gray-400 py-8">
						No coins to analyze. Add some coins to get scam detection insights.
					</p>
				) : (
					coins_with_analysis.slice(0, 10).map((coin) => (
						<div
							key={coin.id}
							className={`border-2 rounded-2xl p-4 transition-all ${getRiskBg(coin.scamAnalysis.riskLevel)}`}
						>
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-center gap-3">
									{getRiskIcon(coin.scamAnalysis.riskLevel)}
									<div>
										<h3 className="font-bold text-gray-900 dark:text-white">
											{coin.name}
										</h3>
										<p className="text-sm text-gray-600 dark:text-gray-300">
											{coin.symbol.toUpperCase()} | Price: ${coin.current_price?.toFixed(2)}
										</p>
									</div>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-sm font-bold ${
										coin.scamAnalysis.riskLevel === "High ⚠️"
											? "bg-red-600 text-white"
											: coin.scamAnalysis.riskLevel === "Medium"
											? "bg-yellow-600 text-white"
											: "bg-green-600 text-white"
									}`}
								>
									{coin.scamAnalysis.riskLevel}
								</span>
							</div>

							{/* Market Metrics */}
							<div className="grid grid-cols-2 gap-2 mb-3 text-sm">
								<div>
									<p className="text-xs text-gray-600 dark:text-gray-400">Market Cap</p>
									<p className="font-semibold text-gray-900 dark:text-white">
										{coin.scamAnalysis.marketCap}
									</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 dark:text-gray-400">24h Volume</p>
									<p className="font-semibold text-gray-900 dark:text-white">
										{coin.scamAnalysis.volume24h}
									</p>
								</div>
							</div>

							{/* Risk Factors */}
							{coin.scamAnalysis.riskFactors.length > 0 && (
								<div>
									<p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-2">
										⚠️ Risk Factors
									</p>
									<ul className="space-y-1">
										{coin.scamAnalysis.riskFactors.map((factor, idx) => (
											<li key={idx} className="text-sm text-gray-700 dark:text-gray-200 flex items-start gap-2">
												<span className="text-red-500 mt-1">•</span>
												<span>{factor}</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					))
				)}
			</div>

			{/* Warning Message */}
			<div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 rounded-lg">
				<p className="text-sm text-blue-900 dark:text-blue-100">
					<strong>⚠️ Disclaimer:</strong> This analysis is AI-based and for informational purposes only.
					Always do your own research (DYOR) before investing. The crypto market is volatile and risky.
					Never invest money you can't afford to lose.
				</p>
			</div>
		</div>
	);
};

export default CryptoScamDetector;
