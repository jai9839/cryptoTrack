import React, { useState, useEffect } from "react";
import { useCurrency } from "../context/CurrencyContext";
import { walletAPI } from "../services/api";
import { toast } from "react-toastify";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

const Wallet = () => {
	const { formatCurrency, currency } = useCurrency();
	const [balance, setBalance] = useState(0);
	const [transactions, setTransactions] = useState([]);
	const [isMockMode, setIsMockMode] = useState(true);
	const [razorpayKeyId, setRazorpayKeyId] = useState("");
	const [loading, setLoading] = useState(true);

	// Deposit Modal States
	const [showDepositModal, setShowDepositModal] = useState(false);
	const [depositAmount, setDepositAmount] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("Simulated_Card");
	const [paymentStep, setPaymentStep] = useState("input"); // input, simulating, card_details, otp, upi_qr, netbanking_select, success, processing

	// Form States
	const [cardNumber, setCardNumber] = useState("");
	const [cardExpiry, setCardExpiry] = useState("");
	const [cardCvv, setCardCvv] = useState("");
	const [cardName, setCardName] = useState("");
	const [otpValue, setOtpValue] = useState("");
	const [selectedBank, setSelectedBank] = useState("SBI");

	// Statistics
	const totalDeposited = transactions
		.filter((tx) => tx.type === "deposit" && tx.status === "success")
		.reduce((sum, tx) => sum + tx.amount, 0);

	const fetchWalletData = async () => {
		try {
			setLoading(true);
			const data = await walletAPI.get();
			setBalance(data.balance);
			setTransactions(data.transactions);
			setIsMockMode(data.isMockMode);
			setRazorpayKeyId(data.razorpayKeyId);
		} catch (err) {
			console.error("Error loading wallet details:", err);
			toast.error("Failed to load wallet data.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchWalletData();
	}, []);

	// Function to load Razorpay script
	const loadRazorpayScript = () => {
		return new Promise((resolve) => {
			if (window.Razorpay) {
				resolve(true);
				return;
			}
			const script = document.createElement("script");
			script.src = "https://checkout.razorpay.com/v1/checkout.js";
			script.async = true;
			script.onload = () => resolve(true);
			script.onerror = () => resolve(false);
			document.body.appendChild(script);
		});
	};

	const handleDepositSubmit = async (e) => {
		e.preventDefault();
		const amount = parseFloat(depositAmount);
		if (isNaN(amount) || amount <= 0) {
			toast.error("Please enter a valid deposit amount.");
			return;
		}

		// Convert from active display currency to base USD currency for storage
		const currentRate = currency[1] || 1;
		const amountInUSD = amount / currentRate;

		// 1. Razorpay integration
		if (paymentMethod === "Razorpay") {
			if (isMockMode) {
				toast.info("Razorpay is not configured on the server. Falling back to Simulated Card Payment.");
				setPaymentMethod("Simulated_Card");
				setPaymentStep("card_details");
				return;
			}

			setPaymentStep("processing");
			const scriptLoaded = await loadRazorpayScript();
			if (!scriptLoaded) {
				toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
				setPaymentStep("input");
				return;
			}

			try {
				const orderResponse = await walletAPI.createOrder(amountInUSD);
				if (!orderResponse.success) {
					toast.error("Failed to initiate order. Try again.");
					setPaymentStep("input");
					return;
				}

				const { order } = orderResponse;

				const options = {
					key: razorpayKeyId,
					amount: order.amount,
					currency: order.currency,
					name: "CryptoTrack Wallet",
					description: `Wallet Deposit: ${formatCurrency(amount)}`,
					order_id: order.id,
					handler: async function (response) {
						setPaymentStep("processing");
						try {
							const verifyRes = await walletAPI.verifyPayment({
								razorpay_order_id: response.razorpay_order_id,
								razorpay_payment_id: response.razorpay_payment_id,
								razorpay_signature: response.razorpay_signature,
								amount: amountInUSD,
							});

							toast.success("Deposit successful via Razorpay!");
							setBalance(verifyRes.balance);
							setTransactions(verifyRes.transactions);
							window.dispatchEvent(
								new CustomEvent("wallet-update", { detail: { balance: verifyRes.balance } })
							);
							setPaymentStep("success");
						} catch (verifyErr) {
							toast.error(verifyErr.response?.data?.error || "Payment verification failed.");
							setPaymentStep("input");
						}
					},
					prefill: {
						name: "Client User",
						email: "user@cryptotrack.com",
					},
					theme: {
						color: "#2563EB",
					},
					modal: {
						ondismiss: function () {
							setPaymentStep("input");
						},
					},
				};

				const rzp = new window.Razorpay(options);
				rzp.open();
			} catch (err) {
				console.error("Razorpay order error:", err);
				toast.error("Could not initiate payment order.");
				setPaymentStep("input");
			}
			return;
		}

		// 2. Simulated / Sandbox Gateways
		if (paymentMethod === "Simulated_Card") {
			setPaymentStep("card_details");
		} else if (paymentMethod === "Simulated_UPI") {
			setPaymentStep("upi_qr");
		} else if (paymentMethod === "Simulated_Netbanking") {
			setPaymentStep("netbanking_select");
		}
	};

	const triggerMockDeposit = async (finalMethod) => {
		setPaymentStep("processing");
		const amount = parseFloat(depositAmount);
		const currentRate = currency[1] || 1;
		const amountInUSD = amount / currentRate;

		try {
			// Artificially wait for realism
			await new Promise((resolve) => setTimeout(resolve, 1500));

			const res = await walletAPI.depositMock(amountInUSD, finalMethod);
			setBalance(res.balance);
			setTransactions(res.transactions);
			window.dispatchEvent(new CustomEvent("wallet-update", { detail: { balance: res.balance } }));
			setPaymentStep("success");
			toast.success(`Simulated deposit of ${formatCurrency(amount)} successful!`);
		} catch (err) {
			console.error(err);
			toast.error("Deposit failed.");
			setPaymentStep("input");
		}
	};

	const handleCardPaymentSubmit = (e) => {
		e.preventDefault();
		if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
			toast.error("All credit card fields are required.");
			return;
		}
		setPaymentStep("otp");
	};

	const handleOtpSubmit = (e) => {
		e.preventDefault();
		if (!otpValue || otpValue.length < 4) {
			toast.error("Please enter a valid OTP code.");
			return;
		}
		triggerMockDeposit("Simulated Card");
	};

	const closeDepositModal = () => {
		setShowDepositModal(false);
		setDepositStep("input");
		setDepositAmount("");
		setCardNumber("");
		setCardExpiry("");
		setCardCvv("");
		setCardName("");
		setOtpValue("");
	};

	return (
		<div className="max-w-7xl mx-auto px-4 py-8 select-none">
			{/* Page Title */}
			<div className="mb-8">
				<h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
					💳 My Fiat Wallet
				</h1>
				<p className="text-gray-500 dark:text-gray-400 mt-2">
					Manage funds, view deposit transactions, and add money using UPI, card, or netbanking.
				</p>
			</div>

			{loading ? (
				<div className="flex justify-center items-center py-20">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
				</div>
			) : (
				<>
					{/* Wallet Dashboard Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						{/* Balance Card */}
						<div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white p-6 shadow-xl flex flex-col justify-between h-48 border border-blue-500/10">
							<div className="absolute top-0 right-0 p-8 opacity-15 transform translate-x-4 -translate-y-4">
								<AccountBalanceWalletIcon sx={{ fontSize: 130 }} />
							</div>
							<div>
								<span className="text-sm font-semibold opacity-80 uppercase tracking-wider">
									Available Wallet Balance
								</span>
								<h2 className="text-4xl font-extrabold mt-2 tracking-tight">
									{formatCurrency(balance * (currency[1] || 1))}
								</h2>
							</div>
							<div className="flex justify-between items-center z-10">
								<span className="text-xs font-mono opacity-70">
									Base: {formatCurrency(balance)} (USD)
								</span>
								<button
									onClick={() => setShowDepositModal(true)}
									className="bg-white text-blue-700 px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
								>
									➕ Deposit Funds
								</button>
							</div>
						</div>

						{/* Total Deposits Card */}
						<div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between h-48">
							<div className="flex items-center gap-4">
								<div className="p-3.5 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-2xl">
									<ArrowUpwardIcon />
								</div>
								<div>
									<span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
										Total Deposited (Life)
									</span>
									<h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
										{formatCurrency(totalDeposited * (currency[1] || 1))}
									</h3>
								</div>
							</div>
							<div className="border-t border-gray-100 dark:border-gray-700/80 pt-4 flex justify-between items-center text-xs text-gray-500">
								<span>Simulated + Real Gateway Logs</span>
								<span className="font-semibold text-green-600">Active Wallet</span>
							</div>
						</div>

						{/* Total Operations Card */}
						<div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-gray-700/50 flex flex-col justify-between h-48">
							<div className="flex items-center gap-4">
								<div className="p-3.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl">
									<ReceiptIcon />
								</div>
								<div>
									<span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
										Transactions Count
									</span>
									<h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
										{transactions.length} Transactions
									</h3>
								</div>
							</div>
							<div className="border-t border-gray-100 dark:border-gray-700/80 pt-4 flex justify-between items-center text-xs text-gray-500">
								<span>Successfully Logged Records</span>
								<span className="font-semibold text-blue-600">Updates Instantly</span>
							</div>
						</div>
					</div>

					{/* Transaction History Section */}
					<div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50 p-6">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
							📜 Deposit Logs & Transaction History
						</h3>

						{transactions.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 text-gray-500">
								<PaymentIcon sx={{ fontSize: 60, opacity: 0.3 }} />
								<p className="mt-4 font-semibold text-gray-600 dark:text-gray-400">
									No deposits logged yet.
								</p>
								<p className="text-sm mt-1 text-gray-400">
									Add money to see your transaction logs here.
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
									<thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 uppercase font-semibold text-xs">
										<tr>
											<th className="px-6 py-4">Transaction ID</th>
											<th className="px-6 py-4">Date</th>
											<th className="px-6 py-4">Method</th>
											<th className="px-6 py-4">Amount</th>
											<th className="px-6 py-4">Status</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
										{transactions.map((tx) => (
											<tr
												key={tx._id || tx.paymentId}
												className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
											>
												<td className="px-6 py-4 font-mono font-bold text-xs text-gray-900 dark:text-gray-200">
													{tx.paymentId}
												</td>
												<td className="px-6 py-4 text-xs">
													{new Date(tx.createdAt).toLocaleString()}
												</td>
												<td className="px-6 py-4 text-xs font-semibold">
													{tx.method}
												</td>
												<td className="px-6 py-4 text-sm font-bold text-green-600">
													+{formatCurrency(tx.amount * (currency[1] || 1))}
												</td>
												<td className="px-6 py-4">
													<span
														className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
															tx.status === "success"
																? "bg-green-150 text-green-700 dark:bg-green-900/20 dark:text-green-400"
																: tx.status === "pending"
																? "bg-yellow-150 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
																: "bg-red-150 text-red-700 dark:bg-red-900/20 dark:text-red-400"
														}`}
													>
														{tx.status === "success" && (
															<span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
														)}
														{tx.status}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</>
			)}

			{/* DEPOSIT MODAL WITH INTEGRATED PAYMENT GATEWAYS */}
			{showDepositModal && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
					<div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700 transform transition-all">
						{/* Header */}
						<div className="bg-slate-50 dark:bg-gray-900/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
							<h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
								{paymentStep === "input" && "💳 Deposit Wallet Balance"}
								{paymentStep === "card_details" && "💳 Credit Card Details"}
								{paymentStep === "otp" && "🔒 One-Time Password (OTP)"}
								{paymentStep === "upi_qr" && "📱 UPI Payment Gateway"}
								{paymentStep === "netbanking_select" && "🏛️ Netbanking Gateways"}
								{paymentStep === "processing" && "⚙️ Processing Payment"}
								{paymentStep === "success" && "🎉 Deposit Success!"}
							</h3>
							<button
								onClick={closeDepositModal}
								className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xl font-bold cursor-pointer"
								disabled={paymentStep === "processing"}
							>
								✕
							</button>
						</div>

						{/* STEP 1: INPUT AMOUNT & SELECT METHOD */}
						{paymentStep === "input" && (
							<form onSubmit={handleDepositSubmit} className="p-6 space-y-5">
								<div>
									<label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
										Enter Deposit Amount
									</label>
									<div className="relative mt-2 rounded-2xl shadow-sm">
										<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
											<span className="text-gray-500 font-bold text-lg">{currency[0]}</span>
										</div>
										<input
											type="number"
											step="1"
											min="10"
											value={depositAmount}
											onChange={(e) => setDepositAmount(e.target.value)}
											placeholder="100"
											className="w-full pl-14 pr-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-650 bg-transparent dark:text-white font-extrabold text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
									{depositAmount && (
										<p className="text-xs text-gray-500 mt-2 pl-1">
											Amount stored in backend:{" "}
											<strong>
												${(parseFloat(depositAmount) / (currency[1] || 1)).toFixed(2)} USD
											</strong>
										</p>
									)}
								</div>

								{/* Payment Options */}
								<div>
									<label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
										Select Payment Gateway
									</label>
									<div className="grid grid-cols-1 gap-2.5 mt-2">
										<label
											className={`flex items-center gap-3 border p-3.5 rounded-2xl cursor-pointer transition-all ${
												paymentMethod === "Simulated_Card"
													? "border-blue-600 bg-blue-50/40 dark:bg-blue-900/10 dark:border-blue-500"
													: "border-gray-250 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700/30"
											}`}
										>
											<input
												type="radio"
												name="payment"
												checked={paymentMethod === "Simulated_Card"}
												onChange={() => setPaymentMethod("Simulated_Card")}
												className="hidden"
											/>
											<CreditCardIcon className="text-blue-600" />
											<div className="text-left">
												<p className="text-sm font-bold text-gray-900 dark:text-white">
													Simulated Card Checkout
												</p>
												<p className="text-xs text-gray-400">Mock Card gateway Sandbox</p>
											</div>
										</label>

										<label
											className={`flex items-center gap-3 border p-3.5 rounded-2xl cursor-pointer transition-all ${
												paymentMethod === "Simulated_UPI"
													? "border-blue-600 bg-blue-50/40 dark:bg-blue-900/10 dark:border-blue-500"
													: "border-gray-250 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700/30"
											}`}
										>
											<input
												type="radio"
												name="payment"
												checked={paymentMethod === "Simulated_UPI"}
												onChange={() => setPaymentMethod("Simulated_UPI")}
												className="hidden"
											/>
											<QrCode2Icon className="text-purple-600" />
											<div className="text-left">
												<p className="text-sm font-bold text-gray-900 dark:text-white">
													Simulated UPI QR Code
												</p>
												<p className="text-xs text-gray-400">Scan & Simulate sandbox payment</p>
											</div>
										</label>

										<label
											className={`flex items-center gap-3 border p-3.5 rounded-2xl cursor-pointer transition-all ${
												paymentMethod === "Simulated_Netbanking"
													? "border-blue-600 bg-blue-50/40 dark:bg-blue-900/10 dark:border-blue-500"
													: "border-gray-250 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700/30"
											}`}
										>
											<input
												type="radio"
												name="payment"
												checked={paymentMethod === "Simulated_Netbanking"}
												onChange={() => setPaymentMethod("Simulated_Netbanking")}
												className="hidden"
											/>
											<AccountBalanceWalletIcon className="text-green-600" />
											<div className="text-left">
												<p className="text-sm font-bold text-gray-900 dark:text-white">
													Simulated Netbanking
												</p>
												<p className="text-xs text-gray-400">Simulate bank auth sandbox</p>
											</div>
										</label>

										<label
											className={`flex items-center gap-3 border p-3.5 rounded-2xl cursor-pointer transition-all ${
												paymentMethod === "Razorpay"
													? "border-blue-600 bg-blue-50/40 dark:bg-blue-900/10 dark:border-blue-500"
													: "border-gray-250 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700/30"
											}`}
										>
											<input
												type="radio"
												name="payment"
												checked={paymentMethod === "Razorpay"}
												onChange={() => setPaymentMethod("Razorpay")}
												className="hidden"
											/>
											<span className="font-bold text-blue-600 text-sm">💳</span>
											<div className="text-left">
												<div className="flex items-center gap-1.5">
													<p className="text-sm font-bold text-gray-900 dark:text-white">
														Razorpay Checkout
													</p>
													{isMockMode && (
														<span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
															Mock Fallback
														</span>
													)}
												</div>
												<p className="text-xs text-gray-400">Standard SDK payment gateway</p>
											</div>
										</label>
									</div>
								</div>

								<button
									type="submit"
									className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg text-sm mt-3"
								>
									🚀 Proceed to Payment
								</button>
							</form>
						)}

						{/* STEP 2A: SIMULATED CARD DETAILS CHECKOUT */}
						{paymentStep === "card_details" && (
							<form onSubmit={handleCardPaymentSubmit} className="p-6 space-y-4">
								<div className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-4 mb-2">
									<p className="text-xs text-gray-500">Merchant: CryptoTrack Wallet</p>
									<p className="text-lg font-bold text-blue-600 mt-0.5">
										Amount: {formatCurrency(parseFloat(depositAmount))}
									</p>
								</div>

								<div>
									<label className="text-[11px] font-bold text-gray-500 uppercase">
										Card Holder Name
									</label>
									<input
										type="text"
										value={cardName}
										onChange={(e) => setCardName(e.target.value)}
										className="w-full mt-1.5 border border-gray-300 dark:border-gray-650 bg-transparent rounded-xl px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
										placeholder="e.g. John Doe"
										required
									/>
								</div>

								<div>
									<label className="text-[11px] font-bold text-gray-500 uppercase">
										Card Number
									</label>
									<input
										type="text"
										value={cardNumber}
										maxLength="19"
										onChange={(e) => {
											// format Card number with spaces
											const v = e.target.value
												.replace(/\s+/g, "")
												.replace(/[^0-9]/gi, "");
											const matches = v.match(/\d{4,16}/g);
											const match = (matches && matches[0]) || "";
											const parts = [];

											for (let i = 0, len = match.length; i < len; i += 4) {
												parts.push(match.substring(i, i + 4));
											}

											if (parts.length > 0) {
												setCardNumber(parts.join(" "));
											} else {
												setCardNumber(v);
											}
										}}
										className="w-full mt-1.5 border border-gray-300 dark:border-gray-650 bg-transparent rounded-xl px-3 py-2 text-sm font-mono dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
										placeholder="4111 2222 3333 4444"
										required
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-[11px] font-bold text-gray-500 uppercase">
											Expiry Date
										</label>
										<input
											type="text"
											value={cardExpiry}
											maxLength="5"
											onChange={(e) => {
												let v = e.target.value.replace(/[^0-9]/g, "");
												if (v.length > 2) {
													v = v.substring(0, 2) + "/" + v.substring(2, 4);
												}
												setCardExpiry(v);
											}}
											className="w-full mt-1.5 border border-gray-300 dark:border-gray-650 bg-transparent rounded-xl px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
											placeholder="MM/YY"
											required
										/>
									</div>
									<div>
										<label className="text-[11px] font-bold text-gray-500 uppercase">
											CVV
										</label>
										<input
											type="password"
											value={cardCvv}
											maxLength="3"
											onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ""))}
											className="w-full mt-1.5 border border-gray-300 dark:border-gray-650 bg-transparent rounded-xl px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
											placeholder="•••"
											required
										/>
									</div>
								</div>

								<div className="flex gap-3 pt-3">
									<button
										type="button"
										onClick={() => setPaymentStep("input")}
										className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold py-3 rounded-xl transition-all text-sm"
									>
										🛟 Back
									</button>
									<button
										type="submit"
										className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm"
									>
										💳 Request OTP
									</button>
								</div>
							</form>
						)}

						{/* STEP 2B: SIMULATED CARD OTP OPTION */}
						{paymentStep === "otp" && (
							<form onSubmit={handleOtpSubmit} className="p-6 space-y-4">
								<div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-950 p-4 rounded-2xl">
									<p className="text-xs text-amber-700 dark:text-amber-300 font-semibold">
										🔑 Simulated Card OTP Sandbox Mode:
									</p>
									<p className="text-xs text-amber-600 dark:text-amber-400/90 mt-1 leading-relaxed">
										Enter any 6-digit number (e.g. <strong>123456</strong>) to simulate card authorization.
									</p>
								</div>

								<div>
									<label className="text-[11px] font-bold text-gray-500 uppercase">
										One-Time Verification Code
									</label>
									<input
										type="text"
										value={otpValue}
										maxLength="6"
										onChange={(e) => setOtpValue(e.target.value.replace(/[^0-9]/g, ""))}
										className="w-full mt-1.5 border border-gray-300 dark:border-gray-650 bg-transparent rounded-xl px-4 py-3 text-lg text-center tracking-widest font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="••••••"
										required
									/>
								</div>

								<div className="flex gap-3 pt-2">
									<button
										type="button"
										onClick={() => setPaymentStep("card_details")}
										className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold py-3 rounded-xl transition-all text-sm"
									>
										🛟 Back
									</button>
									<button
										type="submit"
										className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm"
									>
										🔒 Confirm Payment
									</button>
								</div>
							</form>
						)}

						{/* STEP 2C: SIMULATED UPI QR CODE GATEWAY */}
						{paymentStep === "upi_qr" && (
							<div className="p-6 space-y-5 text-center">
								<div className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-4">
									<p className="text-xs text-gray-500">Scan this QR Code from any UPI App</p>
									<p className="text-lg font-bold text-blue-600 mt-0.5">
										Amount: {formatCurrency(parseFloat(depositAmount))}
									</p>
								</div>

								{/* Mock QR Code */}
								<div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-200 w-48 h-48 mx-auto shadow-sm">
									<div className="text-[120px]">📱</div>
									<p className="text-[10px] text-purple-600 font-mono mt-1 font-bold">
										Simulated-UPI-QR-Channel
									</p>
								</div>

								<p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
									This is a local sandbox QR simulator. To complete deposit, click the simulation confirm button below.
								</p>

								<div className="flex gap-3">
									<button
										onClick={() => setPaymentStep("input")}
										className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold py-3.5 rounded-xl transition-all text-sm"
									>
										✕ Cancel
									</button>
									<button
										onClick={() => triggerMockDeposit("Simulated UPI")}
										className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm"
									>
										✅ Simulate Success
									</button>
								</div>
							</div>
						)}

						{/* STEP 2D: SIMULATED NETBANKING SELECT BANK */}
						{paymentStep === "netbanking_select" && (
							<div className="p-6 space-y-4">
								<div className="bg-slate-50 dark:bg-gray-900 rounded-2xl p-4">
									<p className="text-xs text-gray-500">Selected Bank Gateway Portal</p>
									<p className="text-lg font-bold text-blue-600 mt-0.5">
										Amount: {formatCurrency(parseFloat(depositAmount))}
									</p>
								</div>

								<div>
									<label className="text-[11px] font-bold text-gray-500 uppercase">
										Choose your bank
									</label>
									<select
										value={selectedBank}
										onChange={(e) => setSelectedBank(e.target.value)}
										className="w-full mt-2 border border-gray-300 dark:border-gray-650 bg-transparent rounded-xl px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
									>
										<option value="SBI">State Bank of India (SBI)</option>
										<option value="HDFC">HDFC Bank</option>
										<option value="ICICI">ICICI Bank</option>
										<option value="AXIS">Axis Bank</option>
										<option value="KOTAK">Kotak Mahindra Bank</option>
									</select>
								</div>

								<p className="text-xs text-gray-400">
									We will redirect you to a simulated bank login terminal portal to verify transaction.
								</p>

								<div className="flex gap-3 pt-2">
									<button
										onClick={() => setPaymentStep("input")}
										className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white font-bold py-3.5 rounded-xl transition-all text-sm"
									>
										✕ Cancel
									</button>
									<button
										onClick={() => triggerMockDeposit(`Simulated Netbanking (${selectedBank})`)}
										className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm"
									>
										🏛️ Authenticate
									</button>
								</div>
							</div>
						)}

						{/* STEP 3: LOADER / PROCESSING */}
						{paymentStep === "processing" && (
							<div className="p-12 flex flex-col items-center justify-center space-y-4">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
								<p className="text-sm font-bold text-gray-700 dark:text-gray-300">
									Waiting for Gateway Authorization...
								</p>
								<p className="text-xs text-gray-400">
									Contacting secure ledger network node. Please do not close this window.
								</p>
							</div>
						)}

						{/* STEP 4: SUCCESS MODAL */}
						{paymentStep === "success" && (
							<div className="p-8 text-center space-y-4">
								<div className="flex justify-center text-green-500">
									<CheckCircleIcon sx={{ fontSize: 60 }} />
								</div>
								<div>
									<h4 className="text-lg font-bold text-gray-900 dark:text-white">
										Deposit Successful!
									</h4>
									<p className="text-xs text-gray-500 mt-1 leading-relaxed">
										Your credit check verification cleared successfully. Your wallet balance has been updated immediately.
									</p>
								</div>
								<div className="bg-slate-50 dark:bg-gray-900/60 p-4 rounded-2xl font-mono text-left text-xs text-gray-600 dark:text-gray-400 space-y-1">
									<p>
										Status: <span className="text-green-600 font-bold">SUCCESS</span>
									</p>
									<p>Amount: {formatCurrency(parseFloat(depositAmount))}</p>
									<p>Method: {paymentMethod.replace("Simulated_", "Sandbox ")}</p>
									<p>Timestamp: {new Date().toLocaleString()}</p>
								</div>
								<button
									onClick={closeDepositModal}
									className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm"
								>
									Close
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Wallet;
