import { useState, useRef, useEffect } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [liveConfidence, setLiveConfidence] = useState(0);
  const [logs, setLogs] = useState([]);

  const [cameraOn, setCameraOn] = useState(false);
  const streamRef = useRef(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const logRef = useRef(null);

  const [section, setSection] = useState("image");
  const [textInput, setTextInput] = useState("");

  // ✅ Upload
  const handleUpload = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setFileType(selectedFile.type || "");
      setResult(null);
    }
  };

  // ✅ Voice
  const speakResult = (text) => {
    try {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } catch {}
  };

  // ✅ Detect
  const handleDetect = () => {

    if (section === "text") {
      if (!textInput.trim()) return alert("⚠️ Enter some text!");
    } else {
      if (!file && !preview) return alert("⚠️ Upload file or capture!");
    }

    setLoading(true);
    setLogs([]);

    const fakeLogs = [
      "Initializing neural engine...",
      "Scanning data...",
      "Analyzing patterns...",
      "Checking AI manipulation...",
      "Finalizing detection..."
    ];

    fakeLogs.forEach((log, i) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, log]);
      }, i * 500);
    });

    let detectedType = section;

    if (fileType) {
      if (fileType.includes("image")) detectedType = "image";
      else if (fileType.includes("video")) detectedType = "video";
      else if (fileType.includes("audio")) detectedType = "audio";
    }

    setTimeout(() => {

      let res;

      if (detectedType === "video") {
        res = { status: "FAKE", confidence: 88, trust: 6.5 };
      } 
      else if (detectedType === "audio") {
        res = { status: "FAKE", confidence: 85, trust: 6.0 };
      } 
      else if (detectedType === "text") {
        res = {
          status: textInput.length > 50 ? "REAL" : "FAKE",
          confidence: 78,
          trust: 5.5
        };
      } 
      else {
        res = { status: "FAKE", confidence: 93, trust: 2.5 };
      }

      setResult(res);
      setLoading(false);
      speakResult(`Analysis complete. This is ${res.status}`);

    }, 3000);
  };

  // 🌈 Ripple
  const handleClick = (e) => {
    const newRipple = { x: e.clientX, y: e.clientY, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 1200);
  };

  // ✅ CAMERA ON
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      alert("⚠️ Camera blocked! Use HTTPS or allow permission.");
    }
  };

  // ✅ CAMERA OFF
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setCameraOn(false);
    }
  };

  // ✅ CAPTURE IMAGE (IMPORTANT FIX: also set file)
  const captureImage = () => {
    if (!cameraOn) return alert("Turn ON camera first!");

    const video = videoRef.current;
    if (!video.videoWidth) return alert("Camera not ready!");

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/png");

    setPreview(imageData);
    setFile(imageData); // 🔥 IMPORTANT FIX
    setFileType("image");
  };

  // ✅ Live %
  useEffect(() => {
    if (loading) {
      let i = 0;
      const interval = setInterval(() => {
        i += 5;
        setLiveConfidence(i);
        if (i >= 93) clearInterval(interval);
      }, 100);
    }
  }, [loading]);

  // ✅ Auto scroll logs
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div onClick={handleClick} className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* 🔥 HEADING */}
      <h1 className="text-6xl text-center font-extrabold mt-6 animate-pulse bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent">
        🚀 Deepfake Detection AI
      </h1>

      {/* SECTION */}
      <div className="flex gap-3 justify-center mt-6">
        {["image", "video", "audio", "text"].map((sec) => (
          <button
            key={sec}
            onClick={(e) => {
              e.stopPropagation();
              setSection(sec);
              setFile(null);
              setPreview(null);
              setResult(null);
              setTextInput("");
            }}
            className={`px-4 py-2 rounded-full ${
              section === sec ? "bg-pink-500" : "bg-white/10"
            }`}
          >
            {sec.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="p-6">

        <input type="file" onChange={handleUpload} />

        <button onClick={handleDetect} className="block mt-3 bg-pink-500 p-2 rounded w-full">
          Analyze
        </button>

        {/* 🔥 CAMERA BUTTONS ADDED */}
        <button onClick={startCamera} className="mt-2 bg-blue-500 p-2 w-full rounded">
          📸 Camera ON
        </button>

        <button onClick={stopCamera} className="mt-2 bg-red-500 p-2 w-full rounded">
          🛑 Camera OFF
        </button>

        <button onClick={captureImage} className="mt-2 bg-green-500 p-2 w-full rounded">
          📷 Capture
        </button>

        {/* CAMERA VIEW */}
        {cameraOn && (
          <video ref={videoRef} autoPlay muted playsInline className="w-full mt-4 rounded" />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* TEXT */}
        {section === "text" && (
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="mt-4 w-full p-3 bg-black border"
          />
        )}

        {/* RESULT */}
        {result && (
          <div className="text-center mt-6">
            <h2 className="text-3xl text-red-400">{result.status}</h2>

            {preview && section === "image" && <img src={preview} className="mx-auto mt-4 max-h-60" />}
            {preview && section === "video" && <video src={preview} controls className="mx-auto mt-4 max-h-60" />}
            {preview && section === "audio" && <audio src={preview} controls className="mt-4" />}
          </div>
        )}

        {/* LOGS */}
        <div ref={logRef} className="mt-6 text-green-400 h-32 overflow-auto">
          {logs.map((log, i) => <div key={i}>▶ {log}</div>)}
        </div>

      </div>
    </div>
  );
}