import { useEffect, useState } from "react";
import { generatePriceAlerts } from "../utils/aiUtils";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

const NotificationCenter = ({ coins = [], portfolio = {} }) => {
	const [alerts, setAlerts] = useState([]);
	const [dismissedAlerts, setDismissedAlerts] = useState([]);
	const [notificationsEnabled, setNotificationsEnabled] = useState(true);

	useEffect(() => {
		const newAlerts = generatePriceAlerts(coins, portfolio);
		setAlerts(newAlerts.filter((a) => !dismissedAlerts.includes(a.id)));
	}, [coins, portfolio, dismissedAlerts]);

	const dismissAlert = (alertId) => {
		setDismissedAlerts((prev) => [...prev, alertId]);
		setAlerts((prev) => prev.filter((a) => a.id !== alertId));
	};

	const dismissAllAlerts = () => {
		setDismissedAlerts((prev) => [...prev, ...alerts.map((a) => a.id)]);
		setAlerts([]);
	};

	const sendBrowserNotification = (title, message) => {
		if ("Notification" in window && Notification.permission === "granted") {
			new Notification(title, {
				body: message,
				icon: "/logo.png",
			});
		}
	};

	useEffect(() => {
		if (notificationsEnabled && alerts.length > 0) {
			const alert = alerts[0];
			sendBrowserNotification("Crypto Alert", alert.message);
		}
	}, [alerts, notificationsEnabled]);

	const requestNotificationPermission = async () => {
		if ("Notification" in window) {
			if (Notification.permission === "granted") {
				setNotificationsEnabled(true);
			} else if (Notification.permission !== "denied") {
				const permission = await Notification.requestPermission();
				setNotificationsEnabled(permission === "granted");
			}
		}
	};

	const getAlertColor = (severity) => {
		if (severity === "critical") {
			return "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700";
		}
		return "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700";
	};

	const getAlertIcon = (type, severity) => {
		if (type === "price") {
			return severity === "critical" ? "🚨" : "⚠️";
		}
		return "📢";
	};

	return (
		<div className="bg-white shadow-lg rounded-3xl p-6 dark:bg-gray-800">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<NotificationsActiveIcon className="text-blue-600" />
					<div>
						<h2 className="text-xl font-bold text-gray-900 dark:text-white">
							🔔 Price & Portfolio Alerts
						</h2>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{alerts.length} active notification{alerts.length !== 1 ? "s" : ""}
						</p>
					</div>
				</div>
				{alerts.length > 0 && (
					<button
						onClick={dismissAllAlerts}
						className="rounded-2xl bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 transition-all"
					>
						Dismiss All
					</button>
				)}
			</div>

			{/* Browser Notification Permission */}
			{typeof Notification !== "undefined" && Notification.permission !== "granted" && (
				<div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded-2xl">
					<p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
						Enable browser notifications to get real-time alerts.
					</p>
					<button
						onClick={requestNotificationPermission}
						className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
					>
						Enable Notifications
					</button>
				</div>
			)}

			{/* Alerts List */}
			<div className="space-y-3">
				{alerts.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-lg text-gray-500 dark:text-gray-400 mb-2">
							😊 No active alerts
						</p>
						<p className="text-sm text-gray-400 dark:text-gray-500">
							Alerts will appear here when crypto prices move significantly
						</p>
					</div>
				) : (
					alerts.map((alert) => (
						<div
							key={alert.id}
							className={`border-2 rounded-2xl p-4 flex items-start justify-between transition-all ${getAlertColor(alert.severity)}`}
						>
							<div className="flex items-start gap-3 flex-1">
								<span className="text-2xl mt-1">{getAlertIcon(alert.type, alert.severity)}</span>
								<div>
									<p className="font-bold text-gray-900 dark:text-white">
										{alert.coin}
									</p>
									<p className="text-sm text-gray-700 dark:text-gray-200 mt-1">
										{alert.message}
									</p>
									{alert.type === "portfolio" && (
										<p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
											💡 Consider rebalancing or adding to your position if you believe in long-term growth.
										</p>
									)}
								</div>
							</div>
							<button
								onClick={() => dismissAlert(alert.id)}
								className="ml-4 p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors"
							>
								<CloseIcon className="text-gray-600 dark:text-gray-400" />
							</button>
						</div>
					))
				)}
			</div>

			{/* Alert Settings */}
			<div className="mt-6 border-t border-gray-300 dark:border-gray-600 pt-6">
				<h3 className="font-semibold text-gray-900 dark:text-white mb-4">
					⚙️ Alert Settings
				</h3>
				<div className="space-y-3">
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							checked={notificationsEnabled}
							onChange={(e) => setNotificationsEnabled(e.target.checked)}
							className="w-5 h-5 rounded border-gray-300 cursor-pointer"
						/>
						<span className="text-sm text-gray-700 dark:text-gray-300">
							Enable browser notifications for price movements over 10%
						</span>
					</label>
					<p className="text-xs text-gray-500 dark:text-gray-400 ml-8">
						You'll receive notifications for coins with over 10% daily changes and portfolio holdings that drop over 5%.
					</p>
				</div>
			</div>

			{/* How It Works */}
			<div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
				<p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
					📊 How Alerts Work
				</p>
				<ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
					<li>✓ Price alerts trigger when coins move ±10% in 24h</li>
					<li>✓ Portfolio alerts when your holdings drop over 5%</li>
					<li>✓ Critical alerts for over 20% moves (red flags)</li>
					<li>✓ Alerts are checked every time you load this page</li>
				</ul>
			</div>
		</div>
	);
};

export default NotificationCenter;
