export const BACKEND_URL =
	import.meta.env.VITE_API_URL ||
	(import.meta.env.PROD ? "" : "http://localhost:3000");
export const FRANKFURTER_API = "https://api.frankfurter.app/latest?from=USD";
