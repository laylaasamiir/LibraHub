import React from "react";
import { useLocation } from "react-router-dom";
import "./BookDetails.css";

const BookDetails = () => {
  const location = useLocation();
  const book = location.state;

  if (!book) return <h2>Book not found</h2>;

  return (
    <div className="details-container">
      <div className="book-card-details">

        <img
          src={book.image || "https://via.placeholder.com/200"}
          alt="book"
        />

        <h1>{book.title}</h1>
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Version:</strong> {book.version}</p>
        <p><strong>Code:</strong> {book.bookId}</p>
        <p><strong>Status:</strong> {book.status || "Available"}</p>

      </div>
    </div>
  );
};

export default BookDetails;