import useTopCoins from "../hooks/useTopCoins";
import useCoins from "../hooks/useCoins";
import AIInvestmentAdvisor from "../components/AIInvestmentAdvisor";
import TradingSimulator from "../components/TradingSimulator";
import AIMarketSentimentAnalyzer from "../components/AIMarketSentimentAnalyzer";
import VoiceAssistant from "../components/VoiceAssistant";
import CryptoScamDetector from "../components/CryptoScamDetector";
import DashboardAIChat from "../components/DashboardAIChat";
import Heatmap from "../components/Heatmap";
import LearningSection from "../components/LearningSection";
import NotificationCenter from "../components/NotificationCenter";
import TransactionVisualizer from "../components/TransactionVisualizer";

const Features = ({ portfolio }) => {
	const { coins: marketCoins, loading: marketLoading, error: marketError } = useTopCoins();
	const { coins: portfolioCoins } = useCoins(portfolio);
	const chatCoins = portfolioCoins.length ? portfolioCoins : marketCoins.slice(0, 20);

	return (
		<div className="bg-slate-100 min-h-screen w-full p-4 sm:p-6 lg:p-8 dark:bg-gray-900 dark:text-white">
			<div className="max-w-9xl mx-auto space-y-8">
				<div className="bg-white shadow-lg rounded-xl p-6 dark:bg-gray-800">
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						Advanced Features
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-300">
						AI portfolio analysis, paper trading, sentiment, voice control, scam detection, heatmap, learning, alerts, and blockchain visualization.
					</p>
				</div>

				{marketError && (
					<p className="text-red-500 text-center">{marketError}</p>
				)}

				<div className="grid gap-6 xl:grid-cols-2">
					<AIInvestmentAdvisor portfolio={portfolio} coins={portfolioCoins} />
					<NotificationCenter coins={chatCoins} portfolio={portfolio} />
				</div>

				<TradingSimulator coins={marketLoading ? [] : marketCoins} />

				<div className="grid gap-6 xl:grid-cols-2">
					<AIMarketSentimentAnalyzer coins={marketLoading ? [] : marketCoins} />
					<VoiceAssistant coins={marketLoading ? [] : marketCoins} />
				</div>

				<CryptoScamDetector coins={marketLoading ? [] : marketCoins.slice(0, 30)} />

				<DashboardAIChat coins={chatCoins} portfolio={portfolio} />

				<Heatmap coins={marketLoading ? [] : marketCoins} />

				<div className="grid gap-6 xl:grid-cols-2">
					<LearningSection />
					<TransactionVisualizer coins={marketLoading ? [] : marketCoins.slice(0, 12)} />
				</div>
			</div>
		</div>
	);
};

export default Features;
