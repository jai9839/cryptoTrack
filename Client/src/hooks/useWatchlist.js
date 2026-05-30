import { useEffect, useState } from "react";

import { BACKEND_URL as API_URL } from "../constants";

export default function useWatchlist(watchlist) {
	const [coins, setCoins] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const searchCoins = async () => {
			setLoading(true);
			setError(null);

			if (watchlist.length === 0) {
				setCoins([]);
				setLoading(false);
				return;
			}

			try {
				const coinIds = watchlist.join(",");
				const res = await fetch(
					`${API_URL}/coingecko/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d`
				);
				if (!res.ok) throw new Error("Failed to load watchlist data");
				const data = await res.json();
				setCoins(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		searchCoins();
	}, [watchlist]);

	return {
		coins,
		loading,
		error,
	};
}
