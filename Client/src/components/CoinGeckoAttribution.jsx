import { BACKEND_URL } from "../constants";
const CoinGeckoAttribution = () => {
	return (
		<div className="text-xs text-gray-600 dark:text-gray-400">
			Live market data powered by CoinGecko through the CryptoTrack backend.
			<a
				className="ml-1 text-blue-600 underline hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-600"
				href={BACKEND_URL}
			>
				Backend API
			</a>
		</div>
	);
};

export default CoinGeckoAttribution;
