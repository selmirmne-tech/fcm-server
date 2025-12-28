import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

// Provjera da li je već inicijalizovano Firebase Admin SDK
if (!getApps().length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT env var nije postavljen!");
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: "https://<tvoj-projekat>.firebaseio.com" // zamijeni sa tvojim URL-om baze
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metoda nije dozvoljena" });
  }

  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "Nedostaju podaci (token, title ili body)" });
  }

  console.log("Primljeni podaci:", { token, title, body });

  try {
    await getMessaging().send({
      token: token,
      notification: { title, body },
    });

    console.log("✅ Notifikacija uspješno poslana korisniku:", token);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Greška pri slanju FCM notifikacije:", err);
    return res.status(500).json({ error: err.message });
  }
}
