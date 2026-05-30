import { COUNTRIES } from "../constants/countries";

const PhoneInput = ({ countryCode, setCountryCode, phone, setPhone, disabled }) => {
	const selected = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES.find((c) => c.code === "IN");

	return (
		<div className="flex flex-col gap-2">
			<span className="text-s font-medium text-gray-800 dark:text-gray-400">
				Mobile number (international)
			</span>
			<div className="flex gap-2">
				<select
					value={countryCode}
					onChange={(e) => setCountryCode(e.target.value)}
					disabled={disabled}
					className="border py-2 px-2 rounded-md max-w-[45%] dark:bg-gray-900 dark:border-gray-700"
				>
					{COUNTRIES.map((c) => (
						<option key={c.code} value={c.code}>
							{c.name} (+{c.dial})
						</option>
					))}
				</select>
				<input
					type="tel"
					inputMode="numeric"
					className="border py-2 pl-2.5 rounded-md flex-1 dark:bg-gray-900 dark:border-gray-700"
					placeholder={selected?.code === "IN" ? "9876543210" : "Phone without country code"}
					value={phone}
					onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
					disabled={disabled}
				/>
			</div>
			<p className="text-xs text-gray-500 dark:text-gray-400">
				OTP will be sent via SMS to +{selected?.dial}
				{phone ? phone : "…"} (supports all listed countries)
			</p>
		</div>
	);
};

export default PhoneInput;
