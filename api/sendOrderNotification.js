const { initializeApp } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).send({ error: "Only POST requests allowed" });
    }

    const { token, title, body } = req.body;

    if (!token || !title || !body) {
      return res.status(400).send({ error: "Missing parameters" });
    }

    await getMessaging().send({
      token: token,
      notification: { title, body }
    });

    return res.status(200).send({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Internal server error" });
  }
};
