const admin = require("firebase-admin");

const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com"
  });
}

const db = admin.database();
const messaging = admin.messaging();

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { userId, orderName } = req.body;

  if (!userId) return res.status(400).send("Nedostaje userId");

  try {
    const tokenSnap = await db.ref(`UsersRestoran/${userId}/fcmToken`).get();
    const token = tokenSnap.val();

    if (!token) return res.status(404).send("FCM token nije pronađen");

    await messaging.send({
      token: token,
      data: {
        title: "Narudžba je spremna!",
        body: `Narudžba ${orderName || "Vaša narudžba"} je završena.`
      }
    });

    console.log(`✅ Notifikacija poslata korisniku ${userId}`);
    res.status(200).json({ success: true, message: "Notifikacija poslata!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Greška pri slanju notifikacije", error: error.message });
  }
};
