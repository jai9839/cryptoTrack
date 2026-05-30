import { useEffect, useState } from "react";
import { ChatBubbleOutline, Mic, MicOff, TrendingUp, TrendingDown } from "@mui/icons-material";
import { useCurrency } from "../context/CurrencyContext";
import useCoins from "../hooks/useCoins";
import {
	getAIPredictions,
	getAIChatResponse,
	getAIRecommendations,
	getAIRiskAnalysis,
	getAIMarketSentiment,
	getAIInsights,
	getPriceAlerts,
} from "../utils/aiUtils";

const AI = ({ portfolio }) => {
	const { coins, loading, error } = useCoins(portfolio);
	const { formatCurrency } = useCurrency();
	const [query, setQuery] = useState("");
	const [messages, setMessages] = useState([
		{
			from: "ai",
			text: "Hi! I’m your AI crypto assistant. Ask me about price predictions, portfolio insights, or risk analysis.",
		},
	]);
	const [alerts, setAlerts] = useState([]);
	const [summary, setSummary] = useState("");
	const [sentiment, setSentiment] = useState("");
	const [recommendation, setRecommendation] = useState("");
	const [listening, setListening] = useState(false);
	const [voiceSupported, setVoiceSupported] = useState(false);

	useEffect(() => {
		setVoiceSupported(
			!!(
				window.SpeechRecognition || window.webkitSpeechRecognition
			)
		);
	}, []);

	useEffect(() => {
		if (!loading && coins.length > 0) {
			setAlerts(getPriceAlerts(coins));
			setSentiment(getAIMarketSentiment(coins));
			setSummary(getAIInsights(portfolio, coins));
			setRecommendation(getAIRecommendations(portfolio, coins));
		}
	}, [coins, loading, portfolio]);

	const handleUserMessage = (text) => {
		const answer = getAIChatResponse(text, coins, portfolio);
		setMessages((prev) => [
			...prev,
			{ from: "user", text },
			{ from: "ai", text: answer },
		]);
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		if (!query.trim()) return;
		handleUserMessage(query.trim());
		setQuery("");
	};

	const handleVoice = () => {
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) {
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.lang = "en-US";
		recognition.interimResults = false;
		recognition.maxAlternatives = 1;
		recognition.onstart = () => setListening(true);
		recognition.onend = () => setListening(false);
		recognition.onerror = () => setListening(false);
		recognition.onresult = (event) => {
			const transcript = event.results[0][0].transcript;
			setQuery(transcript);
			handleUserMessage(transcript);
		};
		recognition.start();
	};

	const predictions = getAIPredictions(coins).slice(0, 5);
	const riskAnalysis = getAIRiskAnalysis(coins).slice(0, 5);

	return (
		<div className="bg-slate-100 min-h-screen w-full p-4 sm:p-6 lg:p-8 dark:bg-gray-900 dark:text-white">
			<div className="max-w-9xl mx-auto grid gap-6">
				<div className="bg-white shadow-lg rounded-xl p-6 dark:bg-gray-800">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
								AI Assistant
							</h1>
							<p className="mt-2 text-gray-600 dark:text-gray-300">
								Ask anything — crypto, finance, science, technology, history, or general knowledge.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<button
								onClick={handleVoice}
								className="inline-flex items-center gap-2 rounded-xl border border-blue-600 px-4 py-2 text-blue-700 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-200 dark:hover:bg-blue-600/10"
							>
								{listening ? <MicOff /> : <Mic />}
								{listening ? "Listening..." : voiceSupported ? "Ask by voice" : "Voice unsupported"}
							</button>
						</div>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					<div className="bg-white shadow-lg rounded-xl p-6 dark:bg-gray-800">
						<h2 className="text-lg font-semibold text-gray-600 dark:text-gray-200">
							Market Sentiment
						</h2>
						<p className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">
							{loading ? "Loading..." : sentiment}
						</p>
					</div>
					<div className="bg-white shadow-lg rounded-xl p-6 dark:bg-gray-800">
						<h2 className="text-lg font-semibold text-gray-600 dark:text-gray-200">
							Portfolio Summary
						</h2>
						<p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
							{loading ? "Loading portfolio insights..." : summary}
						</p>
					</div>
					<div className="bg-white shadow-lg rounded-xl p-6 dark:bg-gray-800">
						<h2 className="text-lg font-semibold text-gray-600 dark:text-gray-200">
							Investment Recommendation
						</h2>
						<p className="mt-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
							{loading ? "Analyzing portfolio..." : recommendation}
						</p>
					</div>
				</div>

				<div className="grid gap-6 xl:grid-cols-2">
					<div className="bg-white shadow-lg rounded-xl p-6 dark:bg-gray-800">
						<h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
							AI Price Predictions
						</h2>
						<div className="mt-4 space-y-3">
							{loading ? (
								<p>Loading predictions...</p>
							) : predictions.length ? (
								predictions.map((prediction) => (
									<div
										key={prediction.name}
										className="rounded-2xl border border-slate-200 p-4 dark:border-gray-700"
									>
										<p className="font-semibold text-gray-900 dark:text-white">
											{prediction.name}
										</p>
										<p className="text-sm text-gray-600 dark:text-gray-300">
											{prediction.label}
										</p>
										<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
											Current price: {prediction.currentPrice}
										</p>
									</div>
								))
							) : (
								<p>No prediction data available. Add portfolio coins to enable AI predictions.</p>
							)}
						</div>
					</div>
					<div className="bg-white shadow-lg rounded-xl p-6 dark:bg-gray-800">
						<h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
							Risk Analysis & Alerts
						</h2>
						<div className="mt-4 space-y-4">
							<div className="rounded-2xl border border-slate-200 p-4 dark:border-gray-700">
								<h3 className="font-semibold text-gray-900 dark:text-white">Top Risk Signals</h3>
								{loading ? (
									<p>Loading risk analysis...</p>
								) : riskAnalysis.length ? (
									riskAnalysis.map((risk) => (
										<p
											key={risk.name}
											className="mt-2 text-sm text-gray-600 dark:text-gray-300"
										>
											{risk.name}: {risk.level} ({risk.reason})
										</p>
									))
								) : (
									<p>No risk data available yet.</p>
								)}
							</div>
							<div className="rounded-2xl border border-slate-200 p-4 dark:border-gray-700">
								<h3 className="font-semibold text-gray-900 dark:text-white">Price Alerts</h3>
								{loading ? (
									<p>Loading alerts...</p>
								) : alerts.length ? (
									alerts.map((alert, index) => (
										<p key={index} className="mt-2 text-sm text-gray-600 dark:text-gray-300">
											{alert}
										</p>
									))
								) : (
									<p>No active alerts at the moment.</p>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white shadow-lg rounded-2xl p-6 dark:bg-gray-800">
					<h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
						AI Chatbot Assistant
					</h2>
					<div className="mt-4 space-y-4">
						<div className="max-h-96 overflow-y-auto rounded-3xl border border-slate-200 p-4 dark:border-gray-700">
							{messages.map((message, index) => (
								<div
									key={`${message.from}-${index}`}
									className={`mb-3 rounded-2xl p-4 ${
									message.from === "ai"
										? "bg-slate-100 text-slate-900 dark:bg-gray-900 dark:text-white"
										: "bg-blue-600 text-white"
									}`}
								>
									<p className="text-sm font-semibold uppercase tracking-wide">
										{message.from === "ai" ? "Assistant" : "You"}
									</p>
									<p className="mt-2 text-sm leading-6">{message.text}</p>
								</div>
							))}
						</div>
						<form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
							<input
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Ask anything — crypto, finance, science, tech, history, or everyday questions..."
								className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
							/>
							<button
								type="submit"
								className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
							>
								Send
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AI;
