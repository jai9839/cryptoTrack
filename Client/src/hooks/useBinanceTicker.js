import { useEffect, useState } from "react";

import { BACKEND_URL as API_URL } from "../constants";

export default function useBinanceTicker(symbol = "BTCUSDT") {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchTicker = async () => {
			setLoading(true);
			setError(null);

			try {
				const response = await fetch(
					`${API_URL}/binance/ticker24hr?symbol=${symbol}`
				);
				if (!response.ok) {
					throw new Error("Failed to load Binance ticker data");
				}

				const result = await response.json();
				setData(result);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchTicker();
	}, [symbol]);

	return { data, loading, error };
}
