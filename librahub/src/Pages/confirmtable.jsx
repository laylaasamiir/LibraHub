import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import "./addBook.css";

const ConfirmTable = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  const fetchBorrowedBooks = async () => {
    const snapshot = await getDocs(collection(db, "borrowedBooks"));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBorrowedBooks(list);
  };

  useEffect(() => { fetchBorrowedBooks(); }, []);

  const handleReturn = async (book) => {
    try {
      await updateDoc(doc(db, "books", book.bookDocId), { isBorrowed: false, borrowedByCode: "" });

      const borrowRef = collection(db, "borrowedBooks");
      const borrowQuery = query(borrowRef, where("bookDocId", "==", book.bookDocId), where("status", "==", "borrowed"));
      const borrowSnapshot = await getDocs(borrowQuery);

      if (!borrowSnapshot.empty) {
        const borrowDoc = borrowSnapshot.docs[0];
        await updateDoc(doc(db, "borrowedBooks", borrowDoc.id), { status: "returned", returnedAt: serverTimestamp() });
      }

      fetchBorrowedBooks();
    } catch (error) { console.error(error); alert("Failed to return book."); }
  };

  return (
    <div className="add-book-container">
      <div className="form-card">
        <h2>Confirm Table</h2>
        <table className="books-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Book Title</th>
              <th>Borrow At</th>
              <th>Return At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {borrowedBooks.map(book => (
              <tr key={book.id}>
                <td>{book.studentName}</td>
                <td>{book.bookTitle}</td>
                <td>{book.borrowedAt ? book.borrowedAt.toDate().toLocaleString() : ""}</td>
                <td>{book.returnedAt ? book.returnedAt.toDate().toLocaleString() : "Still Borrowed"}</td>
                <td>
                  {book.status === "borrowed" ? (
                    <button
                      onClick={() => handleReturn(book)}
                      style={{ backgroundColor: "orange", color: "white", padding: "5px 10px", borderRadius: "5px", border: "none", cursor: "pointer" }}
                    >
                      Return
                    </button>
                  ) : (
                    <span style={{ color: "green", fontWeight: "bold" }}>Returned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfirmTable;