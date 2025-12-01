import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/send", async (req, res) => {
  const { token, title, body } = req.body;

  console.log("TOKEN:", token);
  console.log("KEY EXISTS:", !!process.env.FCM_SERVER_KEY);

  if (!token) {
    return res.status(400).json({ error: "Missing token" });
  }

  try {
    const payload = {
      to: token,
      priority: "high",

      // 📌 OVO PRIKAZUJE NOTIFIKACIJU KAD JE APP KILLED
      notification: {
        title: title || "Default Title",
        body: body || "Default Message",
        sound: "default"
      },

      // 📌 Ovo dobija MyFirebaseService kada je app u foregroundu
      data: {
        title: title,
        body: body
      }
    };

    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "key=" + process.env.FCM_SERVER_KEY
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log("FCM RESPONSE:", text);

    res.send(text);

  } catch (err) {
    console.error("FCM ERROR:", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

app.get("/", (req, res) => res.send("FCM Server running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on port " + PORT));
