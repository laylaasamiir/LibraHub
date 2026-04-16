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
          src={book.coverUrl || book.image}
          alt="book"
        />

        <h1>{book.title}</h1>
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Version:</strong> {book.version}</p>
        <p><strong>description</strong> {book.description}</p>
        <p><strong>category</strong> {book.category}</p>
        <p><strong>status</strong> {book.isBorrowed ? <span className="borrowed-status">Borrowed</span> : <span className="available-status">Available</span>}</p>

      </div>
    </div>
  );
};

export default BookDetails;