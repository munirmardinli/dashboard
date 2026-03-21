import Twilio from "twilio";

let twilioClient: ReturnType<typeof Twilio> | undefined;

/**
 * Twilio nutzt die Account SID als API-Username. Fehlt sie, meldet die API "username is required".
 */
function getTwilioClient(): ReturnType<typeof Twilio> {
	const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim() ?? "";
	const authToken = process.env.TWILIO_AUTH_TOKEN?.trim() ?? "";
	if (!accountSid || !authToken) {
		throw new Error(
			"TWILIO_ACCOUNT_SID und TWILIO_AUTH_TOKEN müssen in .env gesetzt sein (Account SID beginnt meist mit AC…)."
		);
	}
	if (!twilioClient) {
		twilioClient = Twilio(accountSid, authToken);
	}
	return twilioClient;
}

/**
 * Twilio WhatsApp erfordert das Kanal-Präfix "whatsapp:" für from und to.
 * Ohne Präfix kann Twilio SMS statt WhatsApp nutzen – dann erscheint nichts in WhatsApp.
 */
function toWhatsappAddress(raw: string | undefined, label: string): string {
	if (!raw?.trim()) {
		throw new Error(`Fehlende Umgebungsvariable für ${label}`);
	}
	const t = raw.trim();
	if (t.toLowerCase().startsWith("whatsapp:")) {
		return t;
	}
	const e164 = t.startsWith("+") ? t : `+${t}`;
	return `whatsapp:${e164}`;
}

export async function sendWhatsapp(message: string): Promise<void> {
	const from = toWhatsappAddress(process.env.TWILIO_WHATSAPP_FROM, "TWILIO_WHATSAPP_FROM");
	const to = toWhatsappAddress(process.env.TWILIO_WHATSAPP_TO, "TWILIO_WHATSAPP_TO");

	try {
		const client = getTwilioClient();
		const res = await client.messages.create({
			body: message,
			from,
			to,
		});

		const status = res.status ?? "?";
		const errCode = res.errorCode;
		const errMsg = res.errorMessage;

		const pending =
			status === "queued" || status === "accepted"
				? " — Zustellung läuft asynchron; WhatsApp-Sandbox: Empfänger muss in der Twilio-Console mit JOIN <code> der Sandbox beitreten, sonst kommt nichts an."
				: "";

		console.log(`📨 Twilio ${res.sid} | ${status} | ${to}${pending}`);

		if (errCode != null || errMsg) {
			console.error("❌ Twilio Meldung:", errCode, errMsg);
		}

		if (status === "failed" || status === "undelivered") {
			console.error(
				"❌ Zustellung fehlgeschlagen — Twilio Console → Monitor → Logs zur Nachricht öffnen; bei Sandbox JOIN prüfen."
			);
		}
	} catch (err) {
		console.error("❌ WhatsApp Fehler:", err);
	}
}
