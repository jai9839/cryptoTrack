import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export const authAPI = {
	sendOtp: async (payload) => {
		const response = await api.post("/auth/otp/send", payload);
		return response.data;
	},

	login: async (payload) => {
		const response = await api.post("/auth/login", payload);
		return response.data;
	},

	register: async (payload) => {
		const response = await api.post("/auth/register", payload);
		return response.data;
	},
};

export const securityAPI = {
	getAdminOverview: async () => {
		const response = await api.get("/auth/admin/overview");
		return response.data;
	},
};

export const portfolioAPI = {
	get: async () => {
		const response = await api.get("/portfolio");
		return response.data;
	},

	update: async (coin, coinData) => {
		const response = await api.put("/portfolio/update", { coin, coinData });
		return response.data;
	},
};

export const watchlistAPI = {
	get: async () => {
		const response = await api.get("/watchlist");
		return response.data;
	},

	add: async (coin) => {
		const response = await api.put("/watchlist/add", { coin });
		return response.data;
	},

	remove: async (coin) => {
		const response = await api.put("/watchlist/remove", { coin });
		return response.data;
	},
};

export const walletAPI = {
	get: async () => {
		const response = await api.get("/wallet");
		return response.data;
	},

	depositMock: async (amount, method) => {
		const response = await api.post("/wallet/deposit/mock", { amount, method });
		return response.data;
	},

	createOrder: async (amount) => {
		const response = await api.post("/wallet/deposit/order", { amount });
		return response.data;
	},

	verifyPayment: async (paymentDetails) => {
		const response = await api.post("/wallet/deposit/verify", paymentDetails);
		return response.data;
	},
};

export default api;
