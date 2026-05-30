const IndiaPhoneHelp = ({ countryCode }) => {
	if (countryCode !== "IN") return null;

	return (
		<div className="text-xs rounded-lg bg-blue-50 text-blue-800 p-3 dark:bg-blue-900/20 dark:text-blue-200">
			<strong>India (+91):</strong> Enter only your 10-digit mobile number.
			<br />
			Example: <code className="font-mono">9876543210</code> — no +91, no 0 at the start.
		</div>
	);
};

export default IndiaPhoneHelp;
