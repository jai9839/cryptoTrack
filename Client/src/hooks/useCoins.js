import { useState, useEffect } from "react";

import { BACKEND_URL as API_URL } from "../constants";

export default function useCoins(portfolio) {
	const portfolioCoins = Object.keys(portfolio);
	const [coins, setCoins] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const searchCoins = async () => {
			setLoading(true);
			setError(null);

			if (portfolioCoins.length === 0) {
				setCoins([]);
				setLoading(false);
				return;
			}

			try {
				const coinIds = portfolioCoins.join(",");
				const res = await fetch(
					`${API_URL}/coingecko/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d`
				);
				if (!res.ok) throw new Error("Failed to load portfolio data");
				const data = await res.json();
				setCoins(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		searchCoins();
	}, [portfolio]);

	return { coins, loading, error };
}
