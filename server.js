const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 20
  })
);

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const ai = apiKey
  ? new GoogleGenAI({ apiKey })
  : null;

app.get("/", (req, res) => {
  res.send("Islamic AI Master Engine backend is running.");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({
        error: "Gemini API key Render par configure nahi hai."
      });
    }

    const message = req.body?.message;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        error: "Please enter a question."
      });
    }

    if (message.length > 12000) {
      return res.status(413).json({
        error: "Message bahut lamba hai. Chhota karke bhejein."
      });
    }

    const result = await ai.models.generateContent({
      model: model,
      contents: message.trim(),
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    res.json({
      reply: result.text || "AI se jawab nahi mil saka."
    });
  } catch (error) {
    console.error("AI error:", error.message);

    res.status(500).json({
      error: "AI response mein problem hui. Render logs check karein."
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Islamic AI backend running on port " + PORT);
});
