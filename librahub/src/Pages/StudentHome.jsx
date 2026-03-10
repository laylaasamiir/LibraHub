import React, { useState, useEffect } from "react";
import "./studentHome.css";
import { collection, addDoc, getDocs ,query,where,doc,deleteDoc} from "firebase/firestore";
import { auth, db } from '../firebase';
import { FaHeart } from 'react-icons/fa';

const StudentHome = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favBooks, setFavBooks] = useState([]);

    const handleToggleFavorite = async (book) => {
       const userId = auth.currentUser ? auth.currentUser.uid : "user_123";
       
        if (favBooks.includes(book.id)) {
           setFavBooks(prev => prev.filter(id => id !== book.id));
            try {
                const q = query(
            collection(db, "favorites"), 
            where("userId", "==", userId),
            where("bookId", "==", book.id)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (document) => {
                await deleteDoc(doc(db, "favorites", document.id));
            });

console.log("Removed from favorites");
        } catch (e) {
            console.error("Error removing:", e);

        setFavBooks(prev => [...prev, book.id]);
        }
        return;
    }
    setFavBooks(prev => [...prev, book.id]);

        try {
            const q = query(
            collection(db, "favorites"), 
            where("userId", "==", userId),
            where("bookId", "==", book.id)
        );
        const existingDocs = await getDocs(q);
        if (existingDocs.empty) {
                await addDoc(collection(db, "favorites"), {
                    bookId: book.id,
                    title: book.title,
                    author: book.author,
                    image: book.image || "",
                    userId: auth.currentUser ? auth.currentUser.uid : "user_123",
                    addedAt: new Date()
                });

                console.log("Saved to firebase");
           } } catch (e) { console.error(e); 
              setFavBooks(prev => prev.filter(id => id !== book.id));
        }
    };

    useEffect(() => {
        const fetchBooksAndFavs = async () => {
            try {
               const booksSnapshot = await getDocs(collection(db, "books"));
            const booksData = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBooks(booksData);
                const userId = auth.currentUser ? auth.currentUser.uid : "user_123";
            const q = query(collection(db, "favorites"), where("userId", "==", userId));
            const favSnapshot = await getDocs(q);
            const favIds = favSnapshot.docs.map(doc => doc.data().bookId);
            setFavBooks(favIds);

            setLoading(false);

            } catch (error) { setLoading(false); }
        };
        fetchBooksAndFavs();
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