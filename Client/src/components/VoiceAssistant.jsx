import { useState } from "react";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import SendIcon from "@mui/icons-material/Send";

const VoiceAssistant = ({ coins = [] }) => {
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [response, setResponse] = useState("");
	const [messages, setMessages] = useState([
		{
			from: "ai",
			text: "🎤 Voice Assistant Ready. Click the mic icon and say something like 'What's Bitcoin price?' or 'Show me Ethereum'",
		},
	]);

	const startVoiceRecognition = () => {
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) {
			alert("Voice recognition not supported in this browser. Please use Chrome, Edge, or Safari.");
			return;
		}

		const recognition = new SpeechRecognition();
		recognition.continuous = false;
		recognition.interimResults = true;
		recognition.lang = "en-US";

		recognition.onstart = () => {
			setIsListening(true);
			setTranscript("");
		};

		recognition.onresult = (event) => {
			let interimTranscript = "";
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					setTranscript(transcript);
					processVoiceInput(transcript);
				} else {
					interimTranscript += transcript;
				}
			}
		};

		recognition.onerror = (event) => {
			console.error("Voice recognition error:", event.error);
			setIsListening(false);
		};

		recognition.onend = () => {
			setIsListening(false);
		};

		recognition.start();
	};

	const processVoiceInput = (input) => {
		const normalized = input.toLowerCase();
		let answer = "I didn't quite understand that. Try asking about crypto prices or market trends.";

		// Find coin in query
		const coin = coins.find(
			(c) =>
				normalized.includes(c.id.toLowerCase()) ||
				normalized.includes(c.symbol.toLowerCase()) ||
				normalized.includes(c.name.toLowerCase())
		);

		if (normalized.includes("price") && coin) {
			answer = `${coin.name} is trading at $${coin.current_price?.toFixed(2)} with a ${coin.price_change_percentage_24h?.toFixed(1)}% change today.`;
		} else if (normalized.includes("bitcoin") || normalized.includes("btc")) {
			const btc = coins.find((c) => c.symbol === "btc");
			if (btc) {
				answer = `Bitcoin is currently at $${btc.current_price?.toFixed(2)}. The market is ${btc.price_change_percentage_24h > 0 ? "up" : "down"} ${Math.abs(btc.price_change_percentage_24h)?.toFixed(1)}% today.`;
			}
		} else if (normalized.includes("ethereum") || normalized.includes("eth")) {
			const eth = coins.find((c) => c.symbol === "eth");
			if (eth) {
				answer = `Ethereum is currently at $${eth.current_price?.toFixed(2)} with a ${eth.price_change_percentage_24h?.toFixed(1)}% change today.`;
			}
		} else if (normalized.includes("trending") || normalized.includes("best")) {
			const topGainer = coins.reduce((best, coin) => {
				if (!best) return coin;
				return (coin.price_change_percentage_24h || 0) > (best.price_change_percentage_24h || 0)
					? coin
					: best;
			}, null);
			if (topGainer) {
				answer = `The best performer today is ${topGainer.name}, up ${topGainer.price_change_percentage_24h?.toFixed(1)}%.`;
			}
		} else if (normalized.includes("hello") || normalized.includes("hi")) {
			answer = "Hello! I'm your crypto voice assistant. Ask me about prices, trends, or market sentiment.";
		}

		setMessages((prev) => [
			...prev,
			{ from: "user", text: input },
			{ from: "ai", text: answer },
		]);
		setResponse(answer);

		// Speak the response
		if ("speechSynthesis" in window) {
			const utterance = new SpeechSynthesisUtterance(answer);
			utterance.rate = 1;
			speechSynthesis.speak(utterance);
		}
	};

	const handleTextInput = (e) => {
		e.preventDefault();
		if (!transcript.trim()) return;
		processVoiceInput(transcript);
		setTranscript("");
	};

	return (
		<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
			<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
				🎤 Voice-Controlled Crypto Assistant
			</h2>

			{/* Chat messages */}
			<div className="space-y-4 max-h-96 overflow-y-auto mb-6 p-4 bg-slate-50 dark:bg-gray-900 rounded-2xl">
				{messages.map((msg, idx) => (
					<div
						key={idx}
						className={`rounded-2xl p-4 ${
							msg.from === "ai"
								? "bg-slate-200 text-gray-900 dark:bg-gray-700 dark:text-white"
								: "bg-blue-500 text-white ml-auto"
						} max-w-xs`}
					>
						<p className="text-xs uppercase tracking-wider font-semibold mb-1">
							{msg.from === "ai" ? "🤖 Assistant" : "👤 You"}
						</p>
						<p className="text-sm leading-relaxed">{msg.text}</p>
					</div>
				))}
			</div>

			{/* Voice input */}
			<div className="space-y-3">
				<div className="flex gap-2">
					<button
						onClick={startVoiceRecognition}
						disabled={isListening}
						className={`flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
							isListening
								? "bg-red-500 text-white"
								: "bg-blue-600 text-white hover:bg-blue-700"
						}`}
					>
						{isListening ? (
							<>
								<StopIcon /> Recording...
							</>
						) : (
							<>
								<MicIcon /> Click & Speak
							</>
						)}
					</button>
				</div>

				{/* Text fallback */}
				<form onSubmit={handleTextInput} className="flex gap-2">
					<input
						type="text"
						value={transcript}
						onChange={(e) => setTranscript(e.target.value)}
						placeholder="Or type your question here..."
						className="flex-1 px-4 py-2 rounded-2xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						type="submit"
						className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all"
					>
						<SendIcon />
					</button>
				</form>

				<p className="text-xs text-gray-500 dark:text-gray-400 text-center">
					💡 Try: "Show Bitcoin price" • "What's the best coin today?" • "Ethereum current price"
				</p>
			</div>
		</div>
	);
};

export default VoiceAssistant;
