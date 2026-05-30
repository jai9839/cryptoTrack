const { maskPhone } = require("./phoneUtils");

const sendOtpSms = async (phoneE164, code, purpose) => {
	const message = `CryptoTrack ${purpose} verification code: ${code}. Valid for 10 minutes. Do not share.`;

	if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
		try {
			const auth = Buffer.from(
				`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
			).toString("base64");
			const body = new URLSearchParams({
				To: phoneE164,
				From: process.env.TWILIO_PHONE_NUMBER,
				Body: message,
			});
			const res = await fetch(
				`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
				{
					method: "POST",
					headers: {
						Authorization: `Basic ${auth}`,
						"Content-Type": "application/x-www-form-urlencoded",
					},
					body,
				}
			);
			if (!res.ok) {
				const err = await res.text();
				console.error("Twilio SMS failed:", err);
				throw new Error("SMS delivery failed");
			}
			return { sent: true, channel: "sms" };
		} catch (err) {
			console.error("Twilio error:", err.message);
			throw err;
		}
	}

	console.log(`[OTP ${purpose}] ${maskPhone(phoneE164)} → ${code}`);
	if (process.env.OTP_DEV_MODE === "true") {
		return { sent: true, channel: "dev", devOtp: code };
	}
	return { sent: true, channel: "console" };
};

module.exports = { sendOtpSms };
