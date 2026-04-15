import React, { useEffect, useState } from "react";
import { collection, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import "./addBook.css";

const ConfirmTable = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  
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
<<<<<<< Updated upstream

    fetchBorrowedBooks();
=======
>>>>>>> Stashed changes

    await updateDoc(doc(db, "books" ,book.bookId),{
      isBorrowed :false,});
   
  };
<<<<<<< Updated upstream
          const calculateFine = (borrowedAt, returnAt) => {
    if (!borrowedAt) return { dueDate: "N/A", fine: 0 };
    const borrowDate = borrowedAt.toDate();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(borrowDate.getDate() + 7);
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
  

=======
>>>>>>> Stashed changes
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
              <th>Due Date</th>
              <th>Return At</th>
              <th>Fine</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
<<<<<<< Updated upstream
           {borrowedBooks.map((book, index) => {
              const { dueDate, fine } = calculateFine(book.borrowedAt, book.returnAt);
           return (
              <tr key={index}>
                <td>{book.studentName}</td>
                <td>{book.bookTitle}</td>
 
                <td>{book.borrowedAt ? book.borrowedAt.toDate().toLocaleString(): "loading..."}</td>
                <td>{dueDate}</td>
=======
            {borrowedBooks.map((book) => (
              <tr key={book.id}>
                <td>{book.studentName}</td>
                <td>{book.bookTitle}</td>

               
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
                            </>)}
                   </td>
                  </tr>
            );})}
=======
                
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
>>>>>>> Stashed changes
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfirmTable;