import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import "./addBook.css";

const BooksTable = () => {

  const [books, setBooks] = useState([]);

  const fetchBooks = async () => {
    const querySnapshot = await getDocs(collection(db, "books"));

    const booksList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    setBooks(booksList);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const deleteBook = async (id) => {
    await deleteDoc(doc(db, "books", id));
    fetchBooks();
  };

  const printCode = (code) => {
    alert("Book Code: " + code);
  };

  return (
    <div className="add-book-container">
      <div className="form-card">
        <h2>Library Books</h2>

        <table className="books-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Version</th>
              <th>Book Code</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.version}</td>
                <td>{book.bookId}</td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteBook(book.id)}
                  >
                    DeleteBook
                  </button>

                  <button
                    className="print-btn"
                    onClick={() => printCode(book.bookId)}
                  >
                    PrintCode
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default BooksTable;