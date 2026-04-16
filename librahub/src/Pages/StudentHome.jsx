import React, { useState, useEffect } from "react";
import "./studentHome.css";
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, getDoc, serverTimestamp , orderBy, startAt, endAt} from "firebase/firestore";
import { auth, db } from '../firebase';
import { FaHeart, FaSearch, FaFilter } from 'react-icons/fa';
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const StudentHome = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favBooks, setFavBooks] = useState([]);
    const [requestedBooks, setRequestedBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState([]);
    const [categorySearch, setCategorySearch] = useState("");
    const [showFilter, setShowFilter] = useState(false);
    const location = useLocation();

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
                await addDoc(collection(db, "favorites"), {
                    bookId: book.id,
                    title: book.title,
                    author: book.author,
                    image: book.coverUrl || book.image || "",
                    userId: auth.currentUser ? auth.currentUser.uid : "user_123",
                    addedAt: new Date()
                });

                console.log("Saved to firebase");
        } catch (e) {
            console.error(e);
            setFavBooks(prev => prev.filter(id => id !== book.id));
        }
    };
    const handleRequest = async (book) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                alert("Please log in to request books.");
                return;
            }

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                alert("Student data not found");
                return;
            }

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

            alert("Request sent successfully");

        } catch (error) {
            console.error("Error sending request:", error);
            alert("Failed to send request");
        }


    }

    useEffect(() => {
        if (location.state?.resetCategory) {
            setSelectedCategory("All");
        }
    }, [location]);

 useEffect(() => {
    const fetchBooksAndFavs = async () => {

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
            //layla

            setBooks(booksData);
             const uniqueCategories = ["All", ...new Set(booksData
                    .map(b => b.category)
                    .filter(Boolean)
                )];
                setCategories(uniqueCategories);

            if (auth.currentUser) {
            const userId = auth.currentUser ? auth.currentUser.uid : "user_123";
            const favQuery = query(collection(db, "favorites"),
                where("userId", "==", userId)
            );

            const favSnapshot = await getDocs(favQuery);
            const favIds = favSnapshot.docs.map(doc => String(doc.data().bookId));
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
    const timeOutId = setTimeout(() => {
        fetchBooksAndFavs();}, 400);
    return () => clearTimeout(timeOutId);
}, [searchTerm]);


const filteredBooks = selectedCategory === "All"
     ? books
        : books.filter(b => b.category === selectedCategory);
    if (loading) return <div className="loading"><h2>Loading... 📚</h2></div>;

    

    return (
        <>
        {/* Overlay */}
            {showFilter && (
                <div className="filter-overlay" onClick={() => setShowFilter(false)} />
            )}

            {/* Sidebar */}
            <div className={`filter-sidebar ${showFilter ? "open" : ""}`}>
                <h3>📂 Categories</h3>
                <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="category-search"
                />

                {categories
                    .filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                    .map(cat => (
                        <button
                            key={cat}
                            className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
                            onClick={() => { setSelectedCategory(cat); setShowFilter(false); }}
                        >
                            {cat}
                        </button>
                    ))}
            </div>
            

        <div className="home-container">
            <h1 className="home-title">Available Books 📚</h1>
            
            <div className="search-filter-wrapper">
            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input 
                    type="text" 
                    placeholder="Search ..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                 <FaFilter
                            className="filter-icon"
                            onClick={() => setShowFilter(!showFilter)}
                        />
                    </div>
            </div>
            
            <div className="books-grid">
                {filteredBooks.map((book) => (
                    <div 
                        key={book.id} 
                        className="book-card"
                        onClick={() => navigate("/book-details", { state: book })}
                        >
                        <div className="favorite-icon" onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(book);
                            }}>
                            <FaHeart className={favBooks.includes(String(book.id)) ? "heart-filled" : "heart-empty"} />
                        </div>
                        <img src={book.coverUrl || book.image|| "https://via.placeholder.com/150"} alt={book.title} className="book-image" />
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
        </div>
        </>
    );
};

export default StudentHome;