import { useState } from "react";
import BookScanner from "../components/BookScanner";
import BookReviewForm from "../components/BookReview";

export default function AiAddBook() {
  const [step, setStep] = useState("scan");
  const [imageBase64, setImage] = useState(null);

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "15px" }}>

      <h2 style={{ marginBottom: "20px" }}>Add New Book</h2>

      {step === "scan" && (
        <BookScanner onImageReady={(img) => { setImage(img); setStep("review"); }} />
      )}

      {step === "review" && (
        <BookReviewForm imageBase64={imageBase64} onSaved={() => setStep("done")} onCancel={() => setStep("scan")} />
      )}

      {step === "done" && (
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "20px", color: "green" }}>Book saved successfully!</p>
          <button onClick={() => setStep("scan")} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px" }}>
            Add Another Book
          </button>
        </div>
      )}
    </div>
  );
}