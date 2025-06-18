const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();
const PAGE_ACCESS_TOKEN = "EAAJ9AW4dmHwBO2N7PGTS3mK56g6CcKRJMTkJlsoykHrLaSB2bwZBArNxlNbaZCMGZCw6Yy5I6FruPPZCNsqmDVOGkjCkNpRT0an49EppUAYDJq6DTRw7LtzXZBf230akmfzWEkTXVBRKUmczdgLk52NFOlNiv3GMnLRj5KqIxuadjmoxZCbuzqgCDCo9NC24NsBftCdQ9x3gZDZD"; // Replace this!
const VERIFY_TOKEN = "mfghelper"; // Set your own

app.use(bodyParser.json());

// Verify webhook
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Handle incoming messages
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message?.attachments) {
        const isImage = webhookEvent.message.attachments.some(att => att.type === "image");

        if (isImage) {
          sendMessage(senderId, "Thanks for the photo! Please wait while we process it.");
        }
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Send message via Messenger API
function sendMessage(senderId, text) {
  const body = {
    recipient: { id: senderId },
    message: { text },
  };

  request({
    uri: "https://graph.facebook.com/v18.0/me/messages",
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: "POST",
    json: body,
  }, (err, res, body) => {
    if (err) console.error("Send error:", err);
  });
}

app.listen(3000, () => console.log("Bot is running on port 3000"));
