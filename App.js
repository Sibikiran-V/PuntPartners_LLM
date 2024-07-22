import React, { useState, useRef } from "react";
import axios from "axios";
import "./styles.css";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [responseAudio, setResponseAudio] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = handleStop;
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
    handleSTT(audioBlob);
  };

  const handleSTT = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
      const { data: text } = await axios.post(
        "http://localhost:5000/stt",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const { data: gptResponse } = await axios.post(
        "http://localhost:5000/gpt",
        {
          prompt: text,
          apiKey,
        }
      );

      const { data: ttsAudio } = await axios.post("http://localhost:5000/tts", {
        text: gptResponse,
      });

      setResponseAudio(ttsAudio.audio_url);
    } catch (error) {
      console.error("Error processing request:", error);
    }
  };

  return (
    <div className="container">
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      <input
        type="text"
        placeholder="OpenAI API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      {responseAudio && <audio src={responseAudio} controls autoPlay />}
    </div>
  );
}

export default App;
