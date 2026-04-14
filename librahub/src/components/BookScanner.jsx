import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

export default function BookScanner({ onImageReady }) {
  const webcamRef = useRef(null);
  const [mode, setMode] = useState("camera");
  const [preview, setPreview] = useState(null);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreview(imageSrc);
  }, [webcamRef]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
        <button
          onClick={() => { setMode("camera"); setPreview(null); }}
          style={{ fontWeight: mode === "camera" ? "bold" : "normal" }}
        >
          Camera
        </button>
        <button
          onClick={() => { setMode("upload"); setPreview(null); }}
          style={{ fontWeight: mode === "upload" ? "bold" : "normal" }}
        >
          Upload
        </button>
      </div>

      {mode === "camera" && !preview && (
        <>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={380}
            style={{ borderRadius: 8 }}
          />
          <br />
          <button onClick={handleCapture} style={{ marginTop: 12 }}>
            Capture
          </button>
        </>
      )}

      {mode === "upload" && !preview && (
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          style={{ marginTop: 12 }}
        />
      )}

      {preview && (
        <>
          <img
            src={preview}
            alt="preview"
            width={280}
            style={{ borderRadius: 8, display: "block", margin: "0 auto 12px" }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button onClick={() => setPreview(null)}>Retake</button>
            <button onClick={() => onImageReady(preview)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}