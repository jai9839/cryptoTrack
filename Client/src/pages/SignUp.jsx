import { useState } from "react";
import { NavLink } from "react-router-dom";
import { authAPI } from "../services/api";
import { COUNTRIES } from "../constants/countries";
import PhoneInput from "../components/PhoneInput";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
	const [step, setStep] = useState(1);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [countryCode, setCountryCode] = useState("IN");
	const [phone, setPhone] = useState("");
	const [otp, setOtp] = useState("");
	const [devOtp, setDevOtp] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const getDial = () => COUNTRIES.find((c) => c.code === countryCode)?.dial || "91";

	const handleStep1 = (e) => {
		e.preventDefault();
		setError("");
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}
		setStep(2);
	};

	const sendOtp = async () => {
		if (phone.length < 4) {
			setError("Enter a valid phone number");
			return;
		}
		setLoading(true);
		setError("");
		try {
			const res = await authAPI.sendOtp({
				countryDial: getDial(),
				phone,
				purpose: "register",
			});
			if (res.devOtp) setDevOtp(res.devOtp);
			setStep(3);
			toast.success(res.message);
		} catch (err) {
			setError(err.response?.data?.error || "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		if (otp.length !== 6) {
			setError("Enter 6-digit OTP");
			return;
		}
		setLoading(true);
		setError("");
		try {
			const res = await authAPI.register({
				username,
				password,
				countryDial: getDial(),
				phone,
				countryCode: `+${getDial()}`,
				otp,
			});
			login(res.token, res.user);
			toast.success("Account created with verified phone!");
			navigate("/dashboard");
		} catch (err) {
			setError(err.response?.data?.error || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-screen flex justify-center">
			<div className="flex flex-col mt-16 sm:mt-20 md:mt-24 justify-center items-center max-w-md w-full px-4">
				<h1 className="text-3xl font-extrabold text-center">Secure Sign Up</h1>
				<p className="mt-1 text-sm text-center text-gray-600 dark:text-gray-400">
					Step {step} of 3 — verify your real mobile with OTP
				</p>
				<p className="mt-1">
					<NavLink to="/login" className="text-blue-700 font-medium dark:text-blue-400">
						Login with existing account
					</NavLink>
				</p>

				{step === 1 && (
					<form onSubmit={handleStep1} className="mt-10 flex flex-col w-full gap-4">
						<div>
							<span className="text-s font-medium">Username</span>
							<input
								type="text"
								className="border py-2 pl-2.5 rounded-md w-full dark:bg-gray-900"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</div>
						<div>
							<span className="text-s font-medium">Password</span>
							<input
								type="password"
								className="border py-2 pl-2.5 rounded-md w-full dark:bg-gray-900"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>
						<div>
							<span className="text-s font-medium">Confirm Password</span>
							<input
								type="password"
								className="border py-2 pl-2.5 rounded-md w-full dark:bg-gray-900"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
						</div>
						{error && <div className="text-red-700 text-center text-sm">{error}</div>}
						<button type="submit" className="bg-blue-700 py-2 text-white rounded-3xl">
							Next: Phone verification
						</button>
					</form>
				)}

				{step === 2 && (
					<div className="mt-10 w-full space-y-4">
						<PhoneInput
							countryCode={countryCode}
							setCountryCode={setCountryCode}
							phone={phone}
							setPhone={setPhone}
						/>
						{error && <div className="text-red-700 text-center text-sm">{error}</div>}
						<button
							type="button"
							onClick={sendOtp}
							disabled={loading}
							className="w-full bg-blue-700 py-2 text-white rounded-3xl disabled:opacity-50"
						>
							{loading ? "Sending OTP…" : "Send OTP to my number"}
						</button>
						<button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 w-full">
							Back
						</button>
					</div>
				)}

				{step === 3 && (
					<form onSubmit={handleRegister} className="mt-10 flex flex-col w-full gap-4">
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
							{loading ? "Creating account…" : "Verify OTP & Create Account"}
						</button>
					</form>
				)}
			</div>
		</div>
	);
};

export default SignUp;
