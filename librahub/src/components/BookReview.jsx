import { useState, useEffect } from "react";
import { extractBookData } from "../aiExtractor";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function BookReview({ imageBase64, onSaved, onCancel }) {
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState({
    title: "",
    author: "",
    version: "",
    category: "",
    description: "",
    coverUrl: null,
  });

  useEffect(() => {
    const processImage = async () => {
      try {
        const data = await extractBookData(imageBase64);
        setBook({
          title: data.title || "",
          author: data.author || "",
          version: data.version || "",
          category: data.category || "",
          description: data.description || "",
          coverUrl: data.coverUrl || imageBase64,
        });
      } catch (err) {
        console.error("AI extraction error:", err);
        alert("AI failed to read image. Please fill the data manually.");
        setBook({
          title: "",
          author: "",
          version: "",
          category: "",
          description: "",
          coverUrl: imageBase64,
        });
      } finally {
        setLoading(false);
      }
    };

    if (imageBase64) {
      processImage();
    }
  }, [imageBase64]);

  const handleSave = async () => {
    try {
      const title = String(book.title || "").trim();
      const author = String(book.author || "").trim();
      const version = String(book.version || "").trim();
      const category = String(book.category || "General").trim();
      const description = String(book.description || "").trim();

      if (!title || !author || !version) {
        alert("Please make sure title, author, and version are filled.");
        return;
      }

      const existingBookQuery = query(
        collection(db, "books"),
        where("title", "==", title),
        where("author", "==", author),
        where("version", "==", version),
      );

      const existingBookSnap = await getDocs(existingBookQuery);

      if (!existingBookSnap.empty) {
        const existingBookDoc = existingBookSnap.docs[0];

        const wantsUpdate = window.confirm(
          "This book already exists. Do you want to update its data?",
        );

        if (!wantsUpdate) return;

        await updateDoc(doc(db, "books", existingBookDoc.id), {
          title,
          author,
          version,
          category,
          description,
          coverUrl: book.coverUrl || imageBase64,
          updatedAt: new Date(),
        });

        alert("Book updated successfully!");
        onSaved();
        return;
      }

      const randomCode = Math.floor(1000000 + Math.random() * 9000000);

      await addDoc(collection(db, "books"), {
        title,
        author,
        version,
        category,
        description,
        coverUrl: book.coverUrl || imageBase64,
        code: randomCode.toString(),
        isBorrowed: false,
        createdAt: new Date(),
      });

      alert(`Book added successfully! Code: ${randomCode}`);
      onSaved();
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Failed to save book. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>📚</div>
        <p style={{ color: "#0d6efd", fontWeight: "bold", fontSize: "18px" }}>
          Analyzing book ...
        </p>
        <p style={{ color: "#999", fontSize: "14px" }}>Please wait</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <img
        src={book.coverUrl || imageBase64}
        alt="Book"
        style={{ width: "120px", borderRadius: "8px", alignSelf: "center" }}
        onError={(e) => {
          e.target.src = imageBase64;
        }}
      />

      <div>
        <label style={labelStyle}>Title *</label>
        <input
          style={inputStyle}
          value={book.title}
          onChange={(e) => setBook({ ...book, title: e.target.value })}
          placeholder="Enter book title"
        />
      </div>

      <div>
        <label style={labelStyle}>Author *</label>
        <input
          style={inputStyle}
          value={book.author}
          onChange={(e) => setBook({ ...book, author: e.target.value })}
          placeholder="Enter author name"
        />
      </div>

      <div>
        <label style={labelStyle}>Version *</label>
        <input
          style={inputStyle}
          value={book.version}
          onChange={(e) => setBook({ ...book, version: e.target.value })}
          placeholder="Enter version (e.g., 1st Edition)"
        />
      </div>

      <div>
        <label style={labelStyle}>Category</label>
        <input
          style={inputStyle}
          value={book.category}
          onChange={(e) => setBook({ ...book, category: e.target.value })}
          placeholder="Enter category (e.g., Science, History)"
        />
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, height: "80px", resize: "vertical" }}
          value={book.description}
          onChange={(e) => setBook({ ...book, description: e.target.value })}
          placeholder="Enter book description"
        />
      </div>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        <button
          onClick={handleSave}
          style={{ ...btnStyle, backgroundColor: "#28a745" }}
        >
          Save Book
        </button>

        <button
          onClick={onCancel}
          style={{ ...btnStyle, backgroundColor: "#dc3545" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

const labelStyle = {
  fontWeight: "600",
  color: "#333",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ddd",
  marginTop: "5px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const btnStyle = {
  flex: 1,
  padding: "12px",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "opacity 0.2s",
};
