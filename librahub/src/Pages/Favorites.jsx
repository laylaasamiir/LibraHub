import React,{useEffect,useState} from "react";
import "./studentHome.css";
import { collection, getDocs,doc,deleteDoc } from "firebase/firestore";
import { db } from '../firebase';

const Favorites = () => {
    const [favBooks, setFavBooks] = useState([]);
    const [loading, setLoading] = useState(true);
        const fetchFavorites = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "favorites"));
                const list = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setFavBooks(list);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching favorites: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);
 
    const removeFromFavorites = async (id) => {
        try {
            await deleteDoc(doc(db, "favorites", id));
            setFavBooks(favBooks.filter(book => book.id !== id));
                alert("Removed from Favorites! 💔");
        } catch (error) {
            console.error("Error removing:", error);
        }
    };
    if (loading) return <div className="home-container"><h2>Loading Favorites...</h2></div>;




    return(
        <div className="home-container">
            
            <div className="books-grid">
                {favBooks.length > 0 ? (
                    favBooks.map((book) => (
                        <div key={book.id} className="book-card">
                            <div className="favorite-icon" onClick={() => removeFromFavorites(book.id)}>💔</div>
                            
                            <img src={book.image || "https://via.placeholder.com/150"} alt={book.title} className="book-image" />
                            
                            <div className="book-info">
                                <h3>{book.title}</h3>
                                <p>By: {book.author}</p>
                                <p className="version">Book ID: {book.bookId}</p> 
                            </div>
                            
                            <button className="request-btn">Request Now</button>
                        </div>
                    ))
                ) : (
                    <div style={{gridColumn: '1/-1', textAlign: 'center'}}>
                        <p>No favorite books yet. Go back and add some! 😊</p>
                    </div>
                )}
            </div>
                        </div>
    );
};

export default Favorites;