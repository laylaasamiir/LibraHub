import React, { useState } from "react";
import "./Borrow.css";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { FaUser, FaLock } from "react-icons/fa";
import { db } from "../firebase";
import AdminRequests from "../components/AdminRequest";

const Borrow = () => {
  const [borrowData, setBorrowData] = useState({
    studentName: "",
    studentCode: "",
    bookCode: "",
  });
  const [messages, setMessage] = useState("");
  const [color, setColor] = useState("");

  const handleChange = (e) => {
    setBorrowData({ ...borrowData, [e.target.name]: e.target.value });
    setMessage("");
    setColor("");
  };

  const handleBorrow = async (e) => {
    e.preventDefault();

    try {
      const booksRef = collection(db, "books");
      let querySnapshot = await getDocs(
        query(booksRef, where("bookId", "==", Number(borrowData.bookCode))),
      );
      if (querySnapshot.empty) {
        querySnapshot = await getDocs(
          query(booksRef, where("bookId", "==", String(borrowData.bookCode))),
        );
      }

      if (querySnapshot.empty) {
        setMessage("No book found with the provided code.");
        setColor("red");
        return;
      }

      const bookDoc = querySnapshot.docs[0];
      const bookData = bookDoc.data();

      if (bookData.isBorrowed === true) {
        setMessage("This book is already borrowed.");
        setColor("#ffc107");
        return;
      }

      const usersSnap = await getDocs(
        query(
          collection(db, "users"),
          where("studentCode", "==", borrowData.studentCode),
        ),
      );
      const studentId = !usersSnap.empty ? usersSnap.docs[0].id : "";

      await addDoc(collection(db, "borrowedBooks"), {
        studentName: borrowData.studentName,
        studentCode: borrowData.studentCode,
        studentId: studentId,
        bookCode: Number(borrowData.bookCode),
        bookDocId: bookDoc.id,
        bookId: bookDoc.id,
        bookTitle: bookData.title,
        borrowedAt: serverTimestamp(),
        status: "borrowed",
      });

      await updateDoc(doc(db, "books", bookDoc.id), {
        isBorrowed: true,
        borrowedByCode: borrowData.studentCode,
      });

      setMessage("Book borrowed successfully!");
      setColor("green");
      setBorrowData({ studentName: "", studentCode: "", bookCode: "" });
    } catch (error) {
      console.error("Error borrowing book:", error);
      alert("Failed to borrow book.");
    }
  };

  const handleReturn = async () => {
    try {
      const booksRef = collection(db, "books");
      let querySnapshot = await getDocs(
        query(booksRef, where("bookId", "==", Number(borrowData.bookCode))),
      );
      if (querySnapshot.empty) {
        querySnapshot = await getDocs(
          query(booksRef, where("bookId", "==", String(borrowData.bookCode))),
        );
      }

      if (querySnapshot.empty) {
        setMessage("❌ Book not found.");
        setColor("red");
        return;
      }

      const bookDoc = querySnapshot.docs[0];
      const bookData = bookDoc.data();

      if (!bookData.isBorrowed) {
        setMessage("⚠️ This book is not currently borrowed.");
        setColor("#ffc107");
        return;
      }

      await updateDoc(doc(db, "books", bookDoc.id), {
        isBorrowed: false,
        borrowedByCode: "",
      });

      const borrowRef = collection(db, "borrowedBooks");
      const snap1 = await getDocs(
        query(
          borrowRef,
          where("bookDocId", "==", bookDoc.id),
          where("status", "==", "borrowed"),
        ),
      );
      const snap2 = await getDocs(
        query(
          borrowRef,
          where("bookId", "==", bookDoc.id),
          where("status", "==", "borrowed"),
        ),
      );

      const allDocs = [
        ...snap1.docs,
        ...snap2.docs.filter((d) => !snap1.docs.find((d1) => d1.id === d.id)),
      ];

      for (const r of allDocs) {
        await updateDoc(doc(db, "borrowedBooks", r.id), {
          status: "returned",
          returnedAt: serverTimestamp(),
        });
      }

      setMessage("✅ Book returned successfully!");
      setColor("green");
      setBorrowData({ studentName: "", studentCode: "", bookCode: "" });
    } catch (error) {
      console.error(error);
      alert("Failed to return book.");
    }
  };

  return (
    <>
      <div className="borrow-page">
        <div className="borrow-card">
          <h2>Borrow Book</h2>
          {messages && (
            <p style={{ color: color, fontWeight: "bold" }}>{messages}</p>
          )}
          <div className="card">
            <label>Enter Student:</label>
            <div className="input-box">
              <FaUser className="icon" />
              <input
                type="text"
                placeholder="Enter Student Name..."
                name="studentName"
                value={borrowData.studentName}
                onChange={handleChange}
              />
            </div>
            <div className="input-box">
              <FaUser className="icon" />
              <input
                type="text"
                placeholder="Enter Student code..."
                name="studentCode"
                value={borrowData.studentCode}
                onChange={handleChange}
              />
            </div>
          </div>
          <label>Enter Book Copy ID:</label>
          <div className="input-box">
            <FaLock className="icon" />
            <input
              type="text"
              placeholder="Enter Book Code..."
              name="bookCode"
              value={borrowData.bookCode}
              onChange={handleChange}
            />
          </div>
          <br />
          <div className="buttons">
            <button className="confirm" onClick={handleBorrow}>
              Confirm Borrow
            </button>
            <button className="return" onClick={handleReturn}>
              Return
            </button>
          </div>
        </div>
      </div>
      <AdminRequests />
    </>
  );
};

export default Borrow;
