import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

app.post("/send", async (req, res) => {
  const { token, title, body } = req.body;

  if (!process.env.FCM_SERVER_KEY) {
    console.log("FCM_KEY MISSING!");
    return res.status(500).json({ error: "Missing server key" });
  }

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "key=" + process.env.FCM_SERVER_KEY
      },
      body: JSON.stringify({
        to: token,
        priority: "high",
        data: {
          title: title,
          body: body
        }
      })
    });

    const data = await response.text();
    console.log("FCM RESPONSE:", data);

    res.send(data);
  } catch (err) {
    console.error("FCM ERROR:", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

app.get("/", (req, res) => res.send("FCM Server running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Running on port " + PORT));
