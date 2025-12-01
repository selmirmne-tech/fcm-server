const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// MAIN FCM SEND NOTIFICATION ENDPOINT
app.post("/send", async (req, res) => {
  const { token, title, body } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Missing token" });
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
        notification: {
          title: title || "Default Title",
          body: body || "Default message"
        }
      })
    });

    const data = await response.json();
    return res.json(data);

  } catch (err) {
    console.error("FCM Error:", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("FCM Server is running.");
});

// RENDER PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
