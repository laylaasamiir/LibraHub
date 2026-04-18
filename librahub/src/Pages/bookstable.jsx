import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./addBook.css";

const BooksTable = () => {
  const [books, setBooks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);

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
    if(window.confirm("Are you sure you want to delete this book?")) {
      await deleteDoc(doc(db, "books", id));
      fetchBooks();
    }
  };

  const openEditModal = (book) => {
    setCurrentBook(book);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const bookRef = doc(db, "books", currentBook.id);
    await updateDoc(bookRef, {
      title: currentBook.title,
      author: currentBook.author,
      category: currentBook.category || "", 
      version: currentBook.version,
      description: currentBook.description,
      coverUrl: currentBook.coverUrl || currentBook.image || currentBook.imageUrl || ""
    });
    setIsModalOpen(false);
    fetchBooks();
  };

  const printCode = (book) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <body onload="window.print();window.close()" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">
          <div style="border:3px solid black; padding:30px; text-align:center; border-radius:15px;">
            <h1 style="margin:0; font-size:24px;">${book.title}</h1>
            <div style="font-size:50px; font-weight:bold; margin:20px 0;">${book.bookId}</div>
            <p style="margin:0;">Library System Code</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="add-book-container">
      <div className="form-card">
        <h2>Library Books</h2>

        <table className="books-table">
          <thead>
            <tr>
              <th>Cover</th> 
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Version</th>
              <th>Book Code</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>
                  <img 
                    src={book.imageUrl || book.coverUrl || book.image || "https://via.placeholder.com/50x70"} 
                    alt="cover" 
                    style={{ width: "50px", height: "70px", borderRadius: "4px", objectFit: "cover" }} 
                  />
                </td>
                <td>{book.title}</td>
                <td>{book.category || "N/A"}</td>
                <td>{book.author}</td>
                <td>{book.version}</td>
                <td>{book.bookId}</td>

                <td>
                  <button className="delete-btn" onClick={() => deleteBook(book.id)}>Delete</button>
                  <button className="print-btn" onClick={() => printCode(book)}>Print</button>
                  <button className="edit-btn" onClick={() => openEditModal(book)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Book</h3>
              <button className="close-x" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="input-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={currentBook.title} 
                  onChange={(e) => setCurrentBook({...currentBook, title: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <input 
                  type="text" 
                  value={currentBook.category || ""} 
                  onChange={(e) => setCurrentBook({...currentBook, category: e.target.value})} 
                  placeholder="e.g. Science, History"
                />
              </div>

              <div className="input-group">
                <label>Author</label>
                <input 
                  type="text" 
                  value={currentBook.author} 
                  onChange={(e) => setCurrentBook({...currentBook, author: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label>Version</label>
                <input 
                  type="text" 
                  value={currentBook.version} 
                  onChange={(e) => setCurrentBook({...currentBook, version: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea 
                  rows="3"
                  value={currentBook?.description || ""} 
                  onChange={(e) => setCurrentBook({...currentBook, description: e.target.value})} 
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksTable;