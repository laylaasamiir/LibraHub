import React, { useEffect, useState } from "react";
import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "./addBook.css";

const ConfirmTable = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowDuration, setBorrowDuration] = useState(7);
  const fetchSettings = async () => {
    const docRef = doc(db, "settings", "libraryConfig");
    const docSnap = await getDocs(collection(db, "settings"));
    if (!docSnap.empty) {
      const config = docSnap.docs.find(d => d.id === "libraryConfig");
      if (config) setBorrowDuration(config.data().borrowDuration);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);
  const fetchBorrowedBooks = async () => {
    const querySnapshot = await getDocs(collection(db, "borrowedBooks")); 
    const borrowedBooksList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setBorrowedBooks(borrowedBooksList);
  };

  
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "borrowedBooks"), (snapshot) => {
      const borrowedBooksList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setBorrowedBooks(borrowedBooksList);
    });

    return () => unsub();
  }, []);

   
  const handleReturn = async (book) => {
    await updateDoc(doc(db, "borrowedBooks", book.id), {
      returnAt: new Date(),
      isBorrowed: false,  
    });

    fetchBorrowedBooks();

    await updateDoc(doc(db, "books" ,book.bookId),{
      isBorrowed :false,});
   
  };
          const calculateFine = (borrowedAt, returnAt) => {
    if (!borrowedAt) return { dueDate: "N/A", fine: 0 };
    const borrowDate = borrowedAt.toDate();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(borrowDate.getDate() + Number(borrowDuration));
    const compareDate = returnAt ? (returnAt.toDate ? returnAt.toDate() : new Date(returnAt)) : new Date();
    compareDate.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    if (compareDate > dueDate) {
      const diffTime = Math.abs(compareDate - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { dueDate: dueDate.toLocaleDateString(), fine: diffDays * 50 };
    }
    return { dueDate: dueDate.toLocaleDateString(), fine: 0 };
  };
  const updateBorrowDuration = async (newDuration) => {
    setBorrowDuration(newDuration);
    const settingsRef = doc(db, "settings", "libraryConfig");
    try {
      await updateDoc(settingsRef, {
        borrowDuration: Number(newDuration)
      });
    } catch (error) {
      console.error("Error updating settings: ", error);
    }
  };

  return (
    <div className="add-book-container">
      <div className="form-card">
        <h2>Confirm Table</h2>

        <div style={{ marginBottom: "20px", padding: "10px", background: "#f8f9fa", borderRadius: "8px", display: "inline-block" }}>
          <label style={{ fontWeight: "bold", marginRight: "10px" }}>Borrow Duration (Days): </label>
          <input 
            type="number" 
            value={borrowDuration} 
            onChange={(e) => updateBorrowDuration(e.target.value)}
            style={{ width: "60px", padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        <table className="books-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Book Title</th>
              <th>Borrow At</th>
              <th>Due Date</th>
              <th>Return At</th>
              <th>Fine</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
           {borrowedBooks.map((book, index) => {
              const { dueDate, fine } = calculateFine(book.borrowedAt, book.returnAt);
           return (
              <tr key={index}>
                <td>{book.studentName}</td>
                <td>{book.bookTitle}</td>
 
                <td>{book.borrowedAt ? book.borrowedAt.toDate().toLocaleString(): "loading..."}</td>
                <td>{dueDate}</td>
            {borrowedBooks.map((book) => (
              <tr key={book.id}>
                <td>{book.studentName}</td>
                <td>{book.bookTitle}</td>

               
                <td>
                  {book.borrowedAt
                    ? book.borrowedAt.toDate().toLocaleString()
                    : "-"}
                </td>
                <td style={{ color: fine > 0 ? "red" : "black", fontWeight: fine > 0 ? "bold" : "normal" }}>
                  {fine} EGP
                </td>

                
                <td>
                  {book.returnAt
                    ? book.returnAt.toDate().toLocaleString()
                    : "Still Borrowed"}
                </td>

                            </>)}
                   </td>
                  </tr>
            );})}
                
                <td
                  style={{
                    color: book.isBorrowed === false ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {book.isBorrowed === false ? (
                    "Returned"
                  ) : (
                    <>
                      Borrowed
                      <br />
                      <button onClick={() => handleReturn(book)}>
                        Return
                      </button>
                    </>
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