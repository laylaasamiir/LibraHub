import React, { useState, useEffect } from "react";
import "./studentHome.css";
<<<<<<< HEAD
    collection, addDoc, getDocs, query, where, doc, deleteDoc, getDoc, serverTimestamp, orderBy, startAt, endAt 
import { auth, db } from '../firebase';
import { FaHeart ,FaSearch} from 'react-icons/fa';
import { FaHeart, FaSearch } from 'react-icons/fa';
=======
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../firebase';
import { FaHeart } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import { FaHeart, FaSearch } from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa';
>>>>>>> 139f1e5fc87f2e61862eb6fd6d67621b42f51264
import Reviews from "./Reviews";

const StudentHome = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favBooks, setFavBooks] = useState([]);
    const [requestedBooks, setRequestedBooks] = useState([]);
    const navigate = useNavigate();

    const handleToggleFavorite = async (book) => {
        const userId = auth.currentUser ? auth.currentUser.uid : "user_123";

        if (favBooks.includes(String(book.id))) {
            setFavBooks(prev => prev.filter(id => id !== String(book.id)));
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
            } catch (e) {
                setFavBooks(prev => [...prev, String(book.id)]);
            }
            return;
        }

        setFavBooks(prev => [...prev, String(book.id)]);

        try {
            await addDoc(collection(db, "favorites"), {
                bookId: book.id,
                title: book.title,
                author: book.author,
                image: book.image || "",
<<<<<<< HEAD
                userId: userId,
=======
                userId: auth.currentUser ? auth.currentUser.uid : "user_123",
>>>>>>> 139f1e5fc87f2e61862eb6fd6d67621b42f51264
                addedAt: new Date()
            });
        } catch (e) {
            setFavBooks(prev => prev.filter(id => id !== String(book.id)));
        }
    };

    const handleRequest = async (book) => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return;

            const studentData = userSnap.data();

            await addDoc(collection(db, "borrowRequests"), {
                studentId: user.uid,
                studentName: studentData.fullName || "",
                studentEmail: studentData.email || user.email || "",
                bookId: book.id,
                bookCode: book.code || "",
                bookTitle: book.title || "",
                status: "pending",
                requestedAt: serverTimestamp()
            });
            setRequestedBooks(prev => [...prev, book.id]);
<<<<<<< HEAD
        } catch (error) {
            console.error(error);
        }
    };
=======
        } catch (error) { }
    }
>>>>>>> 139f1e5fc87f2e61862eb6fd6d67621b42f51264

    useEffect(() => {
        const fetchBooksAndFavs = async () => {
            try {
<<<<<<< HEAD
                let booksQuery;
                if (searchTerm.trim() !== "") {
                    booksQuery = query(
                        collection(db, "books"),
                        orderBy("title"),
                        startAt(searchTerm),
                        endAt(searchTerm + "\uf8ff")
                    );
                } else {
                    booksQuery = collection(db, "books");
                }

                const booksSnapshot = await getDocs(booksQuery);
=======

                const booksSnapshot = await getDocs(collection(db, "books"));
>>>>>>> 139f1e5fc87f2e61862eb6fd6d67621b42f51264
                const booksData = booksSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setBooks(booksData);

<<<<<<< HEAD
                if (auth.currentUser) {
                    const userId = auth.currentUser.uid;
                    
                    // Fetch favorites
                    const favQuery = query(
                        collection(db, "favorites"),
                        where("userId", "==", userId)
                    );
                    const favSnapshot = await getDocs(favQuery);
                    const favIds = favSnapshot.docs.map(doc => String(doc.data().bookId));
                    setFavBooks(favIds);

                    // Fetch requested books
                    const reqQuery = query(
                        collection(db, "borrowRequests"),
                        where("studentId", "==", userId),
                        where("status", "==", "pending")
                    );
                    const reqSnapshot = await getDocs(reqQuery);
                    const reqIds = reqSnapshot.docs.map(doc => doc.data().bookId);
                    setRequestedBooks(reqIds);
                }

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        // Small debounce for search
        const timeOutId = setTimeout(() => {
            fetchBooksAndFavs();
        }, 400);

        return () => clearTimeout(timeOutId);
    }, [searchTerm]);

    if (loading) return <div className="loading"><h2>Loading... 📚</h2></div>;

    return (
        <div className="home-container">
            <h1 className="home-title">Available Books 📚</h1>
            
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search ..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="books-grid">
                {books.map((book) => (
                    <div key={book.id} className="book-card">
                        <div className="favorite-icon" onClick={() => handleToggleFavorite(book)}>
                            <FaHeart className={favBooks.includes(String(book.id)) ? "heart-filled" : "heart-empty"} />
                        </div>
                        <img src={book.image || "https://via.placeholder.com/150"} alt={book.title} className="book-image" />
                        <div className="book-info">
                            <h3>{book.title}</h3>
                            <p className="author">By: {book.author}</p>
                            <p className="description">{book.description}</p>
                            <button
                                className={`request-btn ${book.isBorrowed
                                        ? "borrowed-btn"
                                        : requestedBooks.includes(book.id)
                                            ? "requested-btn"
                                            : ""
                                    }`}
                                disabled={book.isBorrowed || requestedBooks.includes(book.id)}
                                onClick={() => handleRequest(book)}
                            >
                                {book.isBorrowed
                                    ? "Borrowed"
                                    : requestedBooks.includes(book.id)
                                        ? "Requested"
                                        : "Request Book"}
                            </button>
                        </div>
=======
                try {
                    let q;
                    if (searchTerm.trim() !== "") {
                        q = query(
                            collection(db, "books"),
                            orderBy("title"),
                            startAt(searchTerm),
                            endAt(searchTerm + "\uf8ff")
                        );
                    } else {
                        q = collection(db, "books");
                    }
                    const booksSnapshot = await getDocs(q);
                    const booksData = booksSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    setBooks(booksData);
                    useEffect(() => {
                        const fetchBooksAndFavs = async () => {
                            try {
                                const booksSnapshot = await getDocs(collection(db, "books"));
                                const booksData = booksSnapshot.docs.map(doc => ({
                                    id: doc.id,
                                    ...doc.data()
                                }));
                                setBooks(booksData);

                                if (auth.currentUser) {
                                    const userId = auth.currentUser ? auth.currentUser.uid : "user_123";
                                    const favQuery = query(collection(db, "favorites"),
                                        where("userId", "==", userId)
                                    );

                                    const favSnapshot = await getDocs(favQuery);
                                    const favIds = favSnapshot.docs.map(doc => doc.data().bookId);
                                    setFavBooks(favIds);

                                    const favSnapshot = await getDocs(favQuery);
                                    const favIds = favSnapshot.docs.map(doc => doc.data().bookId);
                                    setFavBooks(favIds);


                                    const reqQuery = query(
                                        collection(db, "borrowRequests"),
                                        where("studentId", "==", userId),
                                        where("status", "==", "pending")
                                    );

                                    const reqSnapshot = await getDocs(reqQuery);

                                    const reqIds = reqSnapshot.docs.map(doc => doc.data().bookId);

                                    setRequestedBooks(reqIds);
                                }
                                setLoading(false);

                            } catch (error) {
                                console.error(error);
                                setLoading(false);
                            }
                        };

                        fetchBooksAndFavs();
                    }, []);


                    const timeOutId = setTimeout(() => {
                        fetchBooksAndFavs();
                    }, 400);
                    return () => clearTimeout(timeOutId);
                }, [searchTerm]);
    const filteredBooks = books;
    const reqQuery = query(
        collection(db, "borrowRequests"),
        where("studentId", "==", userId),
        where("status", "==", "pending")
    );

    const reqSnapshot = await getDocs(reqQuery);
    const reqIds = reqSnapshot.docs.map(doc => doc.data().bookId);
    setRequestedBooks(reqIds);
}
setLoading(false);
            } catch (error) {
    setLoading(false);
}
        };

fetchBooksAndFavs();
    }, []);

if (loading) return <div className="loading"><h2>Loading... 📚</h2></div>;

return (
    <div className="home-container">
        <h1 className="home-title">Available Books 📚</h1>
        <div className="books-grid">
            {books.map((book) => (
                <div
                    key={book.id}
                    className="book-card"
                    onClick={() => navigate("/book-details", { state: book })}
                >
                    <div className="favorite-icon" onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(book);
                    }}>
                        <FaHeart className={favBooks.includes(book.id) ? "heart-filled" : "heart-empty"} />
>>>>>>> 139f1e5fc87f2e61862eb6fd6d67621b42f51264
                    </div>
                    <img src={book.image || "https://via.placeholder.com/150"} alt={book.title} className="book-image" />
                    <div className="book-info">
                        <h3>{book.title}</h3>
                        <p className="author">By: {book.author}</p>
                        <p className="description">{book.description}</p>
                        <button
                            className={`request-btn ${book.isBorrowed
                                ? "borrowed-btn"
                                : requestedBooks.includes(book.id)
                                    ? "requested-btn"
                                    : ""
                                }`}
                            disabled={book.isBorrowed || requestedBooks.includes(book.id)}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRequest(book);
                            }}
                        >
                            {book.isBorrowed
                                ? "Borrowed"
                                : requestedBooks.includes(book.id)
                                    ? "Requested"
                                    : "Request Book"}
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <Reviews />
    </div>
);
};

export default StudentHome;