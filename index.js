import express from "express";
import fetch from "node-fetch";
import { GoogleAuth } from "google-auth-library";

const app = express();
app.use(express.json());

// Google Auth — koristi service account iz ENV varijable
const auth = new GoogleAuth({
  credentials: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT),
  scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
});

app.post("/send", async (req, res) => {
  const { token, title, body } = req.body;

  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const projectId = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT).project_id;

    const payload = {
      message: {
        token: token,
        notification: {
          title: title,
          body: body,
        },
        data: {
          title: title,
          body: body,
        },
      },
    };

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text();
    console.log("FCM RESPONSE:", text);

    res.send(text);
  } catch (err) {
    console.error("SEND ERROR:", err);
    res.status(500).json({ error: "Send failed", details: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("FCM v1 server OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
