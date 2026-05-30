const OtpDevHint = ({ devOtp, phoneHint }) => {
	if (!devOtp) return null;

	return (
		<div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 dark:bg-amber-900/25 dark:border-amber-600">
			<p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
				Development mode — SMS not sent to your phone
			</p>
			<p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
				Use this OTP code below{phoneHint ? ` for ${phoneHint}` : ""}:
			</p>
			<p className="mt-2 text-3xl font-mono font-bold tracking-[0.4em] text-center text-amber-950 dark:text-amber-100">
				{devOtp}
			</p>
			<p className="text-[10px] text-amber-700 dark:text-amber-400 mt-2 text-center">
				For real SMS in India, add Twilio credentials in Server/.env
			</p>
		</div>
	);
};

export default OtpDevHint;
