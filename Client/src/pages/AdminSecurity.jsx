import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { securityAPI } from "../services/api";

const AdminSecurity = () => {
	const { user } = useAuth();
	const [data, setData] = useState(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		securityAPI
			.getAdminOverview()
			.then(setData)
			.catch((err) => setError(err.response?.data?.error || "Failed to load"))
			.finally(() => setLoading(false));
	}, []);

	if (user?.role !== "admin") {
		return <Navigate to="/dashboard" replace />;
	}

	if (loading) {
		return <div className="p-8 text-center dark:text-white">Loading security dashboard…</div>;
	}

	if (error) {
		return <div className="p-8 text-center text-red-600">{error}</div>;
	}

	return (
		<div className="bg-slate-100 min-h-screen p-4 sm:p-8 dark:bg-gray-900 dark:text-white">
			<div className="max-w-6xl mx-auto space-y-6">
				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
					<h1 className="text-2xl font-bold">Security & Activity Monitor</h1>
					<p className="text-gray-600 dark:text-gray-300 mt-1">
						See who logged in and how users interact with CryptoTrack.
					</p>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
						<div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-4">
							<p className="text-sm text-gray-500">Total users</p>
							<p className="text-2xl font-bold">{data.stats.totalUsers}</p>
						</div>
						<div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4">
							<p className="text-sm text-gray-500">Failed logins (24h)</p>
							<p className="text-2xl font-bold">{data.stats.failedLogins24h}</p>
						</div>
						<div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-4">
							<p className="text-sm text-gray-500">Session policy</p>
							<p className="text-sm font-semibold">JWT 24h + OTP</p>
						</div>
					</div>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg overflow-x-auto">
					<h2 className="text-lg font-semibold mb-4">Registered users</h2>
					<table className="w-full text-sm text-left">
						<thead>
							<tr className="border-b dark:border-gray-700">
								<th className="py-2">User</th>
								<th>Phone</th>
								<th>Verified</th>
								<th>Last login</th>
								<th>IP</th>
							</tr>
						</thead>
						<tbody>
							{data.users.map((u) => (
								<tr key={u._id} className="border-b dark:border-gray-700">
									<td className="py-2">{u.username}</td>
									<td>{u.phoneE164 || "—"}</td>
									<td>{u.phoneVerified ? "✓" : "—"}</td>
									<td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "—"}</td>
									<td>{u.lastLoginIp || "—"}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg overflow-x-auto">
					<h2 className="text-lg font-semibold mb-4">Login history</h2>
					<table className="w-full text-sm text-left">
						<thead>
							<tr className="border-b dark:border-gray-700">
								<th className="py-2">Time</th>
								<th>User</th>
								<th>Phone</th>
								<th>Status</th>
								<th>IP</th>
							</tr>
						</thead>
						<tbody>
							{data.loginLogs.map((log) => (
								<tr key={log._id} className="border-b dark:border-gray-700">
									<td className="py-2">{new Date(log.createdAt).toLocaleString()}</td>
									<td>{log.username || "—"}</td>
									<td>{log.phoneE164 || "—"}</td>
									<td className={log.success ? "text-green-600" : "text-red-600"}>
										{log.success ? "Success" : log.failureReason || "Failed"}
									</td>
									<td className="max-w-[120px] truncate">{log.ip}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg overflow-x-auto">
					<h2 className="text-lg font-semibold mb-4">Platform usage (recent)</h2>
					<table className="w-full text-sm text-left">
						<thead>
							<tr className="border-b dark:border-gray-700">
								<th className="py-2">Time</th>
								<th>User</th>
								<th>Action</th>
								<th>Path</th>
							</tr>
						</thead>
						<tbody>
							{data.activityLogs.map((a) => (
								<tr key={a._id} className="border-b dark:border-gray-700">
									<td className="py-2">{new Date(a.createdAt).toLocaleString()}</td>
									<td>{a.username}</td>
									<td>{a.action}</td>
									<td className="max-w-[200px] truncate">{a.path}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default AdminSecurity;
