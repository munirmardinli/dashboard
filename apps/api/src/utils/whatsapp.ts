import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

const client = Twilio(accountSid, authToken);

export async function sendWhatsapp(message: string) {
  try {
    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: process.env.TWILIO_WHATSAPP_TO!
    });

    console.log("📨 Nachricht gesendet:", res.sid);
  } catch (err) {
    console.error("❌ WhatsApp Fehler:", err);
  }
}
