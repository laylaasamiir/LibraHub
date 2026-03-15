import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
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
            </tr>
          </thead>

          <tbody>
            {borrowedBooks.map((book, index) => (
              <tr key={index}>
                <td>{book.studentName}</td>
                <td>{book.bookTitle}</td>
                <td>{book.borrowAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConfirmTable;