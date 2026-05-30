import { useState, useEffect } from "react";

import { BACKEND_URL as API_URL } from "../constants";

export default function useTopCoins() {
	const [coins, setCoins] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	useEffect(() => {
		const topCoins = async () => {
			setLoading(true);
			setError(null);
			try {
				const response = await fetch(
					`${API_URL}/coingecko/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d`
				);
				if (!response.ok) {
					throw new Error("Failed to load market data");
				}
				const data = await response.json();
				setCoins(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		topCoins();
	}, []);

	return { coins, loading, error };
}
