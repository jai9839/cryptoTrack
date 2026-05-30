import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";
import { COUNTRIES } from "../constants/countries";
import PhoneInput from "../components/PhoneInput";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = ({ toggleForm, form }) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState("");
	const [step, setStep] = useState("credentials");
	const [countryCode, setCountryCode] = useState("IN");
	const [phone, setPhone] = useState("");
	const [maskedPhone, setMaskedPhone] = useState("");
	const [devOtp, setDevOtp] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const getDial = () => COUNTRIES.find((c) => c.code === countryCode)?.dial || "91";

	const finishLogin = (data) => {
		login(data.token, data.user);
		toast.success("Login successful — phone verified!");
		if (form) toggleForm();
		navigate("/dashboard");
	};

	const handleCredentials = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const res = await authAPI.login({ username, password });
			if (res.step === "complete") {
				finishLogin(res);
				return;
			}
			if (res.step === "setup_phone") {
				setStep("setup_phone");
				toast.info("Verify your phone number to continue.");
				return;
			}
			if (res.step === "otp") {
				setStep("otp");
				setMaskedPhone(res.phone || "");
				if (res.devOtp) setDevOtp(res.devOtp);
				toast.info(res.message);
			}
		} catch (err) {
			setError(err.response?.data?.error || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	const sendSetupOtp = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await authAPI.sendOtp({
				countryDial: getDial(),
				phone,
				purpose: "verify",
			});
			if (res.devOtp) setDevOtp(res.devOtp);
			setStep("setup_otp");
			toast.success(res.message);
		} catch (err) {
			setError(err.response?.data?.error || "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};

	const handleOtpSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			const payload = { username, password, otp };
			if (step === "setup_otp") {
				payload.countryDial = getDial();
				payload.phone = phone;
				payload.countryCode = `+${getDial()}`;
			}
			const res = await authAPI.login(payload);
			if (res.step === "complete") {
				finishLogin(res);
			}
		} catch (err) {
			setError(err.response?.data?.error || "Verification failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-screen flex justify-center">
			<div className="flex flex-col mt-20 sm:mt-28 md:mt-32 justify-center items-center max-w-md w-full px-4">
				<h1 className="text-3xl font-extrabold text-center">Secure Login</h1>
				<p className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400">
					Password + OTP to your registered mobile
				</p>
				<p className="mt-1">
					Or{" "}
					<NavLink to="/signup" className="text-blue-700 font-medium dark:text-blue-400">
						create a new account
					</NavLink>
				</p>

				{step === "credentials" && (
					<form onSubmit={handleCredentials} className="mt-10 flex flex-col w-full gap-4">
						<div>
							<span className="text-s font-medium text-gray-800 dark:text-gray-400">Username</span>
							<input
								type="text"
								className="border py-2 pl-2.5 rounded-md w-full dark:bg-gray-900"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</div>
						<div>
							<span className="text-s font-medium text-gray-800 dark:text-gray-400">Password</span>
							<input
								type="password"
								className="border py-2 pl-2.5 rounded-md w-full dark:bg-gray-900"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						{error && <div className="text-red-700 text-center text-sm">{error}</div>}
						<button
							type="submit"
							disabled={loading}
							className="bg-blue-700 py-2 text-white rounded-3xl hover:bg-blue-600 disabled:opacity-50"
						>
							{loading ? "Checking…" : "Continue"}
						</button>
					</form>
				)}

				{step === "setup_phone" && (
					<div className="mt-10 w-full space-y-4">
						<p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
							Link your real mobile number for OTP security (all countries supported).
						</p>
						<PhoneInput
							countryCode={countryCode}
							setCountryCode={setCountryCode}
							phone={phone}
							setPhone={setPhone}
						/>
						{error && <div className="text-red-700 text-center text-sm">{error}</div>}
						<button
							type="button"
							onClick={sendSetupOtp}
							disabled={loading || phone.length < 4}
							className="w-full bg-blue-700 py-2 text-white rounded-3xl"
						>
							Send OTP
						</button>
					</div>
				)}

				{(step === "otp" || step === "setup_otp") && (
					<form onSubmit={handleOtpSubmit} className="mt-10 flex flex-col w-full gap-4">
						<p className="text-sm text-gray-600 dark:text-gray-300 text-center">
							Enter the 6-digit OTP sent to {maskedPhone || "your phone"}
						</p>
						{devOtp && (
							<p className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded dark:bg-amber-900/30">
								Dev mode OTP: <strong>{devOtp}</strong>
							</p>
						)}
						<input
							type="text"
							maxLength={6}
							className="border py-3 text-center text-2xl tracking-widest rounded-md dark:bg-gray-900"
							placeholder="000000"
							value={otp}
							onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
							required
						/>
						{error && <div className="text-red-700 text-center text-sm">{error}</div>}
						<button
							type="submit"
							disabled={loading || otp.length !== 6}
							className="bg-blue-700 py-2 text-white rounded-3xl disabled:opacity-50"
						>
							{loading ? "Verifying…" : "Verify & Login"}
						</button>
					</form>
				)}
			</div>
		</div>
	);
};

export default Login;
