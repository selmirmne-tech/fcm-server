import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Only POST allowed");
  }

  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const message = {
    to: token,
    notification: {
      title,
      body
    }
  };

  const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "key=" + process.env.FCM_SERVER_KEY
    },
    body: JSON.stringify(message)
  });

  const text = await fcmResponse.text();

  return res.status(fcmResponse.status).send(text);
}
