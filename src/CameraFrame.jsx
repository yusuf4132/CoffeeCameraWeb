import React, { useRef, useState, useEffect } from "react";

export default function CameraFrameApp() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [text, setText] = useState("");
  const [stream, setStream] = useState(null);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      console.error("Kamera erişimi hatası:", err);
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Video boyutuna göre ayarla
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Kameradan görüntü al
    ctx.drawImage(videoRef.current, 0, 0);

    // Çerçeve PNG ekle (sen değiştireceksin)
    const frame = new Image();
    frame.src = "/frame.png";

    frame.onload = () => {
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

      // Üst yazı
      ctx.font = "40px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(text, canvas.width / 2, 50);

      // Yazıcıya gönder (base64)
      const dataUrl = canvas.toDataURL("image/png");
      sendToPrinter(dataUrl);
    };
  };

  const sendToPrinter = (imageData) => {
    console.log("Yazıcıya gönderiliyor:", imageData);
    // Buraya backend API bağlayacaksın
    // Örn: fetch("http://localhost:3000/print", { method: "POST", body: JSON.stringify({ image: imageData }) })
  };

  return (
    <div style={{ display: "flex", gap: 20, padding: 20 }}>
      {/* Kamera Alanı */}
      <div style={{ position: "relative", width: 400, height: 300, border: "2px solid black" }}>
        <video
          ref={videoRef}
          autoPlay
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {/* Üst yazı canlı preview */}
        <div
          style={{
            position: "absolute",
            top: 10,
            width: "100%",
            textAlign: "center",
            color: "white",
            fontSize: 24,
            fontWeight: "bold"
          }}
        >
          {text}
        </div>

        {/* Çerçeve overlay */}
        <img
          src="/frame.png"
          alt="frame"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none"
          }}
        />
      </div>

      {/* Sağ Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2>Hoşgeldiniz</h2>

        <input
          type="text"
          placeholder="Emoji ve isminizi ekleyin..."
          maxLength={50}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: 10, fontSize: 16 }}
        />

        <button
          onClick={captureImage}
          style={{
            padding: 15,
            backgroundColor: "#2196f3",
            color: "white",
            border: "none",
            borderRadius: 5,
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          Resim Çek
        </button>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
