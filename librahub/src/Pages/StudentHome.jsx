import React, { useState, useEffect } from "react";
import "./studentHome.css";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { auth, db } from '../firebase';
import { FaHeart } from 'react-icons/fa';

const StudentHome = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favBooks, setFavBooks] = useState([]);

    const handleToggleFavorite = async (book) => {
        if (favBooks.includes(book.id)) {
            setFavBooks(favBooks.filter(id => id !== book.id));
        } else {
            setFavBooks([...favBooks, book.id]);
            try {
                await addDoc(collection(db, "favorites"), {
                    bookId: book.id,
                    title: book.title,
                    author: book.author,
                    image: book.image || "",
                    userId: auth.currentUser ? auth.currentUser.uid : "user_123",
                    addedAt: new Date()
                });
            } catch (e) { console.error(e); }
        }
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "books"));
                const booksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBooks(booksData);
                setLoading(false);
            } catch (error) { setLoading(false); }
        };
        fetchBooks();
    }, []);

    if (loading) return <div className="loading"><h2>Loading... 📚</h2></div>;

    return (
        <div className="home-container">
            <h1 className="home-title">Available Books 📚</h1>
            <div className="books-grid">
                {books.map((book) => (
                    <div key={book.id} className="book-card">
                        <div className="favorite-icon" onClick={() => handleToggleFavorite(book)}>
                            <FaHeart className={favBooks.includes(book.id) ? "heart-filled" : "heart-empty"} />
                        </div>
                        <img src={book.image || "https://via.placeholder.com/150"} alt={book.title} className="book-image" />
                        <div className="book-info">
                            <h3>{book.title}</h3>
                            <p className="author">By: {book.author}</p>
                            <p className="description">{book.description}</p>
                            <button className="request-btn">Request Book</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentHome;