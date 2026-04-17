import React, { useEffect, useState } from "react";
import "./studentHome.css";
import { collection, getDocs, doc, deleteDoc, getDoc, serverTimestamp, addDoc,query,where } from "firebase/firestore";
import { auth, db } from '../firebase';
import { useNavigate } from "react-router-dom"; 

const Favorites = () => {
    const navigate = useNavigate(); 
    const [favBooks, setFavBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booksData, setBooksData] = useState({});

    const fetchBooks = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "books"));
            const booksList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            const booksMap = booksList.reduce((acc, book) => {
                acc[book.id] = book;
                return acc;
            }, {});
            setBooksData(booksMap);
        } catch (error) {
            console.error("Error fetching books: ", error);
        }
    };

    const fetchFavorites = async () => {
        try {
            const user=auth.currentUser;
            if(!user){
                setLoading(false);
                return;
            }
            const q=query(collection(db,"favorites"),where("userId","==",user.uid));
            const querySnapshot = await getDocs(q);

            const list = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const updatedFavorites = list.map(book => ({
                ...book,
              
                ...booksData[book.bookId], 
                id: book.bookId, 
                favDocId: book.id 
            }));
            setFavBooks(updatedFavorites);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching favorites: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            setLoading(true);
           try{
            const querySnapshot = await getDocs(collection(db, "books"));
                const booksList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                const booksMap = booksList.reduce((acc, book) => {
                    acc[book.id] = book;
                    return acc;
                }, {});
                setBooksData(booksMap);
              
                const q = query(collection(db, "favorites"), where("userId", "==", user.uid));
                const favSnapshot = await getDocs(q);

                const list = favSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                const updatedFavorites = list.map(favItem => ({
                        ...favItem,
                        ...booksMap[favItem.bookId],
                        id: favItem.bookId, 
                        favDocId: favItem.id 
                    }));

                setFavBooks(updatedFavorites);
             } catch (error) {
                console.error("Error loading favorites:", error);
           } 
           setLoading(false);
        } else {
            setFavBooks([]);
            setLoading(false);
        }
    });
return () => unsubscribe();
    }, []);
       

    const removeFromFavorites = async (e, favDocId) => {
        e.stopPropagation();
        try {
            await deleteDoc(doc(db, "favorites", favDocId));
            setFavBooks(favBooks.filter(book => book.favDocId !== favDocId));
            alert("Removed from Favorites! 💔");
        } catch (error) {
            console.error("Error removing:", error);
        }
    };

    if (loading) return <div className="home-container"><h2>Loading Favorites...</h2></div>;

    return (
        <div className="home-container">
            <h1 className="home-title">My Favorites ❤️</h1>
            <div className="books-grid">
                {favBooks.length > 0 ? (
                    favBooks.map((book) => (
                        <div 
                            key={book.favDocId} 
                            className="book-card"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate("/book-details", { state: book })} 
                        >
                            <div className="favorite-icon" onClick={(e) => removeFromFavorites(e, book.favDocId)}>
                                💔
                            </div>

                            <img src={book.image || "https://via.placeholder.com/150"} alt={book.title} className="book-image" />

                            <div className="book-info">
                                <h3>{book.title}</h3>
                                <p className="author">By: {book.author}</p>
                            </div>

                            <span className={`status-badge ${book.isBorrowed ? "status-borrowed" : "status-available"}`}>
                                {book.isBorrowed ? "Borrowed" : "Available"}
                            </span>
                        </div>
                    ))
                ) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                        <p>No favorite books yet. Go back and add some! 😊</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;