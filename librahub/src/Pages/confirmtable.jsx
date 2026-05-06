import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./addBook.css";

const ConfirmTable = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowDuration, setBorrowDuration] = useState(7);
<<<<<<< HEAD

=======
  const [dailyFine, setDailyFine] = useState(30);
>>>>>>> 53ed599c35bd6a2a76c06dfca42055977034cecc
  const fetchSettings = async () => {
    const docRef = doc(db, "settings", "libraryConfig");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
<<<<<<< HEAD
      setBorrowDuration(docSnap.data().borrowDuration);
=======
      const data = docSnap.data();
      setBorrowDuration(docSnap.data().borrowDuration);
      setDailyFine(data.dailyFine || 30);
>>>>>>> 53ed599c35bd6a2a76c06dfca42055977034cecc
    }
  };


  const fetchBorrowedBooks = async () => {
    const querySnapshot = await getDocs(collection(db, "borrowedBooks")); 
    const borrowedBooksList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setBorrowedBooks(borrowedBooksList);
  };

  useEffect(() => {
    fetchSettings();
    fetchBorrowedBooks();
  }, []);

const handleReturn = async (borrowEntry) => {
    try {
    
      const borrowRef = doc(db, "borrowedBooks", borrowEntry.id);
      await updateDoc(borrowRef, {
        returnAt: new Date(),
        status: "returned"
      });
      if (borrowEntry.bookId) { 
        const bookRef = doc(db, "books", borrowEntry.bookId); 
        
        await updateDoc(bookRef, {
          isBorrowed: false, 
          borrowedByCode: "" 
        });
        
        console.log("Book availability updated!");
      } else {
        console.error("Missing bookId in document");
      }

      alert("✅ Returned and Books Table Updated!");
      fetchBorrowedBooks(); 

    } catch (error) {
      console.error("Error:", error);
      alert("❌ Failed to update book status.");
    }
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
<<<<<<< HEAD
      return { dueDate: dueDate.toLocaleDateString(), fine: diffDays * 50 };
    }
    return { dueDate: dueDate.toLocaleDateString(), fine: 0 };
  };

=======
      return { dueDate: dueDate.toLocaleDateString(), fine: diffDays * dailyFine };
  }
    
    return { dueDate: dueDate.toLocaleDateString(), fine: 0 };
  };

  const updateDailyFine = async (newFine) => {
  setDailyFine(newFine);
  const settingsRef = doc(db, "settings", "libraryConfig");
  try {
    await updateDoc(settingsRef, {
      dailyFine: Number(newFine)
    });
  } catch (error) {
    console.error("Error updating fine: ", error);
  }
};

>>>>>>> 53ed599c35bd6a2a76c06dfca42055977034cecc
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
            min="1"
            value={borrowDuration} 
            onChange={(e) => updateBorrowDuration(e.target.value)}
            style={{ width: "60px", padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>

<<<<<<< HEAD
=======
        <div style={{ marginBottom: "20px", padding: "10px", background: "#f8f9fa", borderRadius: "8px", display: "inline-block", marginLeft: "10px" }}>
          <label style={{ fontWeight: "bold", marginRight: "10px" }}>Daily Fine (EGP): </label>
                <input 
                  type="number" 
                  min="10"
                  value={dailyFine} 
                  onChange={(e) => updateDailyFine(e.target.value)}
                  style={{ width: "60px", padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
                />
       </div>

>>>>>>> 53ed599c35bd6a2a76c06dfca42055977034cecc
        <table className="books-table">
          <thead>
            <tr>
              <th>Student Code</th> 
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
                 
                  <td>{book.studentCode || "N/A"}</td> 
                  <td>{book.bookTitle}</td>
                  <td>{book.borrowedAt ? book.borrowedAt.toDate().toLocaleString() : "loading..."}</td>
                  <td>{dueDate}</td>
                  <td>
                    {book.returnAt ? 
                      (book.returnAt.toDate ? book.returnAt.toDate().toLocaleString() : book.returnAt.toLocaleString()) 
                      : "Still Borrowed"}
                  </td>
                  <td style={{ color: fine > 0 ? "red" : "black", fontWeight: fine > 0 ? "bold" : "normal" }}>
                    {fine} EGP
                  </td>

                  <td style={{ color: book.returnAt ? "green" : "red", fontWeight: "bold" }}>
                    {book.returnAt ? "Returned" : (
                      <>
                        Borrowed
                        <br />
                        <button className="edit-btn" onClick={() => handleReturn(book)}>
                          Return
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfirmTable;