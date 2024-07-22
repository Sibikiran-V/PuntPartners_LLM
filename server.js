const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// STT Endpoint
app.post("/stt", async (req, res) => {
  try {
    const audio = req.body.audio;
    const response = await axios.post(
      "https://api.deepgram.com/v1/listen",
      audio,
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/wav",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GPT Endpoint
app.post("/gpt", async (req, res) => {
  try {
    const { prompt, apiKey } = req.body;
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data.choices[0].message.content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TTS Endpoint
app.post("/tts", async (req, res) => {
  try {
    const text = req.body.text;
    const response = await axios.post(
      "https://api.deepgram.com/v1/speak",
      { text },
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
