import { useState, useEffect } from "react";
import { extractBookData } from "../aiExtractor";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function BookReview({ imageBase64, onSaved, onCancel }) {
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState({ title: "", author: "", version: "", category: "", description: "", coverUrl: null });

  useEffect(() => {
    const processImage = async () => {
      try {
        const data = await extractBookData(imageBase64);
        setBook(data);
      } catch (err) {
        alert("AI failed to read image");
      } finally {
        setLoading(false);
      }
    };
    processImage();
  }, [imageBase64]);

  const handleSave = async () => {
    const radomNumber = Math.floor(1000000 + Math.random() * 9000000);
    try {
      const docRef = await addDoc(collection(db, "books"), {
        ...book,
        bookId: radomNumber,
        createdAt: new Date()
      });
      console.log("Document written with ID: ", radomNumber);
      alert(`Book added successfully! ID: ${radomNumber}`);
      onSaved();

      setBook({ title: "", author: "", version: "", description: "" });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add book.");
    }
  };


if (loading) return (
  <div style={{ textAlign: "center", padding: "40px" }}>
    <div style={{ fontSize: "40px", marginBottom: "10px" }}>📚</div>
    <p style={{ color: "#0d6efd", fontWeight: "bold", fontSize: "18px" }}>Analyzing book ...</p>
    <p style={{ color: "#999", fontSize: "14px" }}>Please wait</p>
  </div>
);

return (
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    <img
      src={book.coverUrl || imageBase64}
      alt="Book"
      style={{ width: "120px", borderRadius: "8px", alignSelf: "center" }}
    />

    <div>
      <label>Title</label>
      <input style={inputStyle} value={book.title} onChange={e => setBook({ ...book, title: e.target.value })} />
    </div>

    <div>
      <label>Author</label>
      <input style={inputStyle} value={book.author} onChange={e => setBook({ ...book, author: e.target.value })} />
    </div>
    <div>
      <label>Version</label>
      <input style={inputStyle} value={book.version} onChange={e => setBook({ ...book, version: e.target.value })} />
    </div>

    <div>
      <label>Description</label>
      <textarea style={{ ...inputStyle, height: "80px" }} value={book.description} onChange={e => setBook({ ...book, description: e.target.value })} />
    </div>

    <div style={{ display: "flex", gap: "10px" }}>
      <button onClick={handleSave} style={{ ...btnStyle, backgroundColor: "#28a745" }}>Save</button>
      <button onClick={onCancel} style={{ ...btnStyle, backgroundColor: "#dc3545" }}>Cancel</button>
    </div>
  </div>
);
}

const inputStyle = { width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ddd", marginTop: "5px" };
const btnStyle = { flex: 1, padding: "12px", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" };