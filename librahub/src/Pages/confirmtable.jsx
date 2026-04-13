import React, { useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./addBook.css";

const ConfirmTable = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  
  const fetchBorrowedBooks = async () => {
    const querySnapshot = await getDocs(collection(db, "borrowedBooks")); 
    const borrowedBooksList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setBorrowedBooks(borrowedBooksList);
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const handleReturn =async(id ) =>{
    await updateDoc(doc(db,"borrowedBooks",id), {
      returnAt: new Date(),
     
    });

    fetchBorrowedBooks();

  };
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
           {borrowedBooks.map((book, index) => {
              const { dueDate, fine } = calculateFine(book.borrowedAt, book.returnAt);
           return (
              <tr key={index}>
                <td>{book.studentName}</td>
                <td>{book.bookTitle}</td>
 
                <td>{book.borrowedAt ? book.borrowedAt.toDate().toLocaleString(): "loading..."}</td>
                <td>{dueDate}</td>
                <td>
                    {book.returnAt ? (book.returnAt.toDate? book.returnAt.toDate().toLocaleString(): book.returnAt.toLocaleString()) : "Still Borrowed"}
                </td>
                <td style={{ color: fine > 0 ? "red" : "black", fontWeight: fine > 0 ? "bold" : "normal" }}>
                  {fine} EGP
                </td>

                 <td
                       style={{
                        color: book.returnAt ? "green" : "red",
                         fontWeight: "bold"
                              }}  >
                         {book.returnAt ?( "Returned") : (
                          <>
                          Borrowed
                          <br />
                          <button onClick={()=> handleReturn(book.id)}>
                            Return
                          </button>

                            </>)}
                   </td>
                  </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfirmTable;