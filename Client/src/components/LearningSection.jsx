import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const lessons = [
	{
		title: "What is Blockchain?",
		description:
			"A blockchain is a decentralized ledger that records transactions in chained blocks, making data secure and tamper-resistant.",
		details: `Blockchain technology works by creating a chain of blocks, each containing a cryptographic hash of the previous block. This creates an immutable record of transactions. Every participant in the network validates new blocks, ensuring security without a central authority. Key characteristics include: transparency (all transactions visible), immutability (can't change past records), and decentralization (no single point of failure).`,
	},
	{
		title: "What is Bitcoin?",
		description:
			"Bitcoin is the first cryptocurrency, created as digital money that runs without a central bank.",
		details: `Bitcoin was created in 2009 by an anonymous developer (or group) known as Satoshi Nakamoto. It operates on a blockchain network secured by miners who validate transactions. Bitcoin has a fixed supply of 21 million coins, making it inherently scarce. It uses Proof-of-Work consensus, where miners compete to solve complex puzzles to add blocks. Bitcoin is stored in digital wallets and can be transferred peer-to-peer without intermediaries.`,
	},
	{
		title: "What is Ethereum?",
		description:
			"Ethereum is a blockchain platform that enables smart contracts and decentralized applications. Its native token is ether (ETH).",
		details: `Ethereum was launched in 2015 by Vitalik Buterin. Unlike Bitcoin, Ethereum supports smart contracts—self-executing code that runs on the blockchain. This enables DeFi (Decentralized Finance), NFTs (Non-Fungible Tokens), and DAOs (Decentralized Autonomous Organizations). Ethereum uses Proof-of-Stake consensus (after the 2022 merge), which is more energy-efficient than Proof-of-Work. The network processes transactions and executes smart contracts.`,
	},
	{
		title: "What is Staking?",
		description:
			"Staking locks crypto for network security and rewards users with additional tokens.",
		details: `Staking is a process where cryptocurrency holders deposit their coins to validate network transactions and earn rewards. In Proof-of-Stake systems, stakers lock their coins for a period and receive interest-like returns. The more you stake, the more rewards you earn, but you also risk losing coins if you behave maliciously (slashing). Popular staking options include ETH staking (5-10% annual yield), Solana (SOL), and Cardano (ADA). Staking is passive income generation.`,
	},
	{
		title: "How to Manage Risk?",
		description:
			"Diversify across coins, use stop-loss rules, and keep a portion of stable assets for protection.",
		details: `Risk management is critical in crypto investing. Key strategies: 1) Diversification - don't put all money in one coin; 2) Position sizing - risk only what you can afford to lose; 3) Stop-loss orders - automatically sell if price drops X%; 4) Dollar-cost averaging - buy smaller amounts over time instead of lump sum; 5) Stablecoins - keep some in USDT/USDC for opportunities; 6) Rebalancing - maintain target allocations; 7) Do your own research (DYOR) before investing.`,
	},
	{
		title: "What is DeFi?",
		description:
			"Decentralized Finance (DeFi) is a financial system built on blockchain without traditional intermediaries like banks.",
		details: `DeFi applications run on smart contracts and allow users to lend, borrow, trade, and earn interest without banks. Popular DeFi platforms include Uniswap (decentralized exchange), Aave (lending), Curve (stablecoin trading), and Yearn (yield farming). Benefits include: lower fees, 24/7 availability, programmable transactions. Risks include: smart contract bugs, flash loan attacks, and extreme volatility. DeFi is growing rapidly but remains experimental.`,
	},
	{
		title: "What are NFTs?",
		description: "NFTs (Non-Fungible Tokens) are unique digital assets representing ownership of art, collectibles, and virtual items.",
		details: `NFTs are tokens on blockchain where each token is unique and cannot be replaced (unlike Bitcoin, which is fungible). They're commonly used for digital art, gaming items, domain names, and collectibles. You buy NFTs using cryptocurrency and store them in digital wallets. The blockchain proves your ownership. While some NFTs sell for millions, many have little value. The NFT market is highly speculative and risky.`,
	},
	{
		title: "Crypto Trading Strategies",
		description: "Learn common strategies like HODLing, day trading, swing trading, and arbitrage.",
		details: `1) HODLing - buy and hold long-term (months/years); 2) Day Trading - open and close positions daily; 3) Swing Trading - hold for days/weeks; 4) Scalping - micro trades for small profits; 5) Arbitrage - buy low on one exchange, sell high on another; 6) Yield farming - earn rewards by providing liquidity. Each strategy has different risk/reward profiles. Beginners often benefit most from HODLing. Active trading requires skill and discipline.`,
	},
	{
		title: "Security Best Practices",
		description: "Protect your crypto with hardware wallets, strong passwords, and two-factor authentication.",
		details: `Crypto security is crucial: 1) Use hardware wallets (Ledger, Trezor) for large amounts; 2) Never share private keys; 3) Use strong, unique passwords with password managers; 4) Enable 2FA on exchanges; 5) Verify URLs carefully to avoid phishing; 6) Use cold storage for long-term holdings; 7) Diversify across multiple wallets. Hacks happen frequently—secure your assets properly!`,
	},
	{
		title: "Reading Charts & Technical Analysis",
		description: "Learn candlestick patterns, support/resistance, moving averages, and indicators.",
		details: `Technical analysis helps predict price movements. Key concepts: 1) Candlesticks show open/high/low/close prices; 2) Support - price floor; Resistance - price ceiling; 3) Moving averages - smooth out price trends; 4) RSI (Relative Strength Index) - overbought/oversold; 5) MACD - momentum indicator; 6) Trends - uptrend, downtrend, sideways. Chart patterns like head-and-shoulders or triangles signal potential moves. Practice reading charts before trading real money!`,
	},
];

const LearningSection = () => {
	const [expandedIndex, setExpandedIndex] = useState(null);

	const toggleExpand = (index) => {
		setExpandedIndex(expandedIndex === index ? null : index);
	};

	return (
		<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
					📚 Crypto Learning Academy
				</h2>
				<p className="mt-2 text-gray-600 dark:text-gray-300">
					Master crypto concepts, trading strategies, and security best practices to become a confident investor.
				</p>
			</div>

			<div className="space-y-3">
				{lessons.map((lesson, idx) => (
					<div
						key={idx}
						className="rounded-2xl border border-slate-200 overflow-hidden dark:border-gray-700 hover:shadow-md transition-shadow"
					>
						<button
							onClick={() => toggleExpand(idx)}
							className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
						>
							<div className="flex-1">
								<h3 className="font-bold text-gray-900 dark:text-white text-lg">
									{idx < 5 ? "🎯" : idx < 8 ? "📈" : "🔐"} {lesson.title}
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
									{lesson.description}
								</p>
							</div>
							<div
								className={`ml-4 text-gray-400 dark:text-gray-500 transition-transform ${
									expandedIndex === idx ? "rotate-180" : ""
								}`}
							>
								<ExpandMoreIcon />
							</div>
						</button>

						{expandedIndex === idx && (
							<div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-slate-200 dark:border-gray-700">
								<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
									{lesson.details}
								</p>
								<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-xl">
									<p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
										💡 Pro Tip: Always start small, learn from mistakes, and never invest more than you can afford to lose.
									</p>
								</div>
							</div>
						)}
					</div>
				))}
			</div>

			<div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-2xl border border-blue-200 dark:border-purple-700">
				<h3 className="font-bold text-gray-900 dark:text-white mb-2">
					🚀 Ready to Start Investing?
				</h3>
				<p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
					This learning section covers the fundamentals. Remember:
				</p>
				<ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
					<li>✅ Do your own research (DYOR) before investing</li>
					<li>✅ Start with small amounts you can afford to lose</li>
					<li>✅ Use the trading simulator to practice without real money</li>
					<li>✅ Follow the AI advisor recommendations</li>
					<li>✅ Never share your private keys or seed phrases</li>
					<li>✅ Diversify your portfolio across multiple assets</li>
				</ul>
			</div>

			<div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-2xl border border-yellow-200 dark:border-yellow-700">
				<p className="text-xs text-yellow-800 dark:text-yellow-200">
					<strong>⚠️ Risk Disclaimer:</strong> Cryptocurrency is highly volatile and risky. This educational content is for informational purposes only and not financial advice. Always consult a financial advisor before investing.
				</p>
			</div>
		</div>
	);
};

export default LearningSection;
