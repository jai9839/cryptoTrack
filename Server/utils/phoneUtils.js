/** E.164 validation for international numbers (all countries). */
const parsePhone = (countryDial, localNumber) => {
	const dial = String(countryDial || "").replace(/\D/g, "");
	const local = String(localNumber || "").replace(/\D/g, "");
	if (!dial || local.length < 4 || local.length > 14) {
		return { valid: false, error: "Enter a valid phone number for your country." };
	}
	const e164 = `+${dial}${local}`;
	if (!/^\+\d{8,15}$/.test(e164)) {
		return { valid: false, error: "Invalid international phone format." };
	}
	return { valid: true, phoneE164: e164, countryDial: dial };
};

const maskPhone = (phoneE164) => {
	if (!phoneE164 || phoneE164.length < 6) return "***";
	return `${phoneE164.slice(0, 3)}****${phoneE164.slice(-2)}`;
};

module.exports = { parsePhone, maskPhone };
