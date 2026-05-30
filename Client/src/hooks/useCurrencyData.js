import { useState, useEffect } from "react";

import { BACKEND_URL as API_URL } from "../constants";

export default function useCurrencyData() {
	const [currencyData, setCurrencyData] = useState({ rates: {} });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function getCurrency() {
			try {
				setLoading(true);
				setError(null);
				const res = await fetch(`${API_URL}/currency`);

				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Failed to fetch currency rates");
				}
				setCurrencyData(data);
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		}

		getCurrency();
	}, []);

	return {
		currencyData,
		loading,
		error,
	};
}
