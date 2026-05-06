import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { FaHeart, FaStar } from "react-icons/fa";
import "./BookDetails.css";

const BookDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const book = location.state;

  const [isFav, setIsFav] = useState(false);
  const [favDocId, setFavDocId] = useState(null);
  const [isRequested, setIsRequested] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser || !book) return;
      const userId = auth.currentUser.uid;

      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) setUserRole(userDoc.data().role);

      const favQ = query(
        collection(db, "favorites"),
        where("userId", "==", userId),
        where("bookId", "==", book.id),
      );
      const favSnap = await getDocs(favQ);
      if (!favSnap.empty) {
        setIsFav(true);
        setFavDocId(favSnap.docs[0].id);
      }

      const reqQ = query(
        collection(db, "borrowRequests"),
        where("studentId", "==", userId),
        where("bookId", "==", book.id),
        where("status", "==", "pending"),
      );
      const reqSnap = await getDocs(reqQ);
      if (!reqSnap.empty) setIsRequested(true);

      const revQ = query(
        collection(db, "reviews"),
        where("bookId", "==", book.id),
      );
      const revSnap = await getDocs(revQ);
      setReviews(revSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, [book]);

  const handleFavorite = async () => {
    if (!auth.currentUser || userRole !== "student") return;
    const userId = auth.currentUser.uid;
    if (isFav) {
      await deleteDoc(doc(db, "favorites", favDocId));
      setIsFav(false);
      setFavDocId(null);
    } else {
      const docRef = await addDoc(collection(db, "favorites"), {
        bookId: book.id,
        title: book.title,
        author: book.author,
        image: book.coverUrl || book.image || "",
        userId,
        addedAt: new Date(),
      });
      setIsFav(true);
      setFavDocId(docRef.id);
    }
  };

  const handleRequest = async () => {
    if (!auth.currentUser || userRole !== "student") return;
    if (isRequested || book.isBorrowed) return;
    try {
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const studentData = userSnap.data();
      await addDoc(collection(db, "borrowRequests"), {
        studentId: auth.currentUser.uid,
        studentName: studentData.fullName || "",
        studentEmail: studentData.email || auth.currentUser.email || "",
        bookId: book.id,
        bookCode: book.code || "",
        bookTitle: book.title || "",
        status: "pending",
        requestedAt: serverTimestamp(),
      });
      setIsRequested(true);
      alert("Request sent successfully ✅");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmitReview = async () => {
    if (!auth.currentUser || userRole !== "student") return;
    if (!comment.trim() || rating === 0) return;
    setSubmitting(true);
    try {
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userName = userSnap.data()?.fullName || "Anonymous";
      const newReview = {
        bookId: book.id,
        bookTitle: book.title,
        userId: auth.currentUser.uid,
        userName,
        comment,
        rating,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "reviews"), newReview);
      setReviews((prev) => [...prev, { id: docRef.id, ...newReview }]);
      setComment("");
      setRating(0);
    } catch (error) {
      console.error(error);
    }
    setSubmitting(false);
  };

  if (!book) return <h2>Book not found</h2>;

  return (
    <div className="bd-container">
      <div className="bd-card">
        <div className="bd-header">
          <img
            src={book.coverUrl || book.image || "https://placehold.co/150x200"}
            alt="book"
            onError={(e) => {
              e.target.src = "https://placehold.co/150x200";
            }}
            className="bd-image"
          />
          <button className="bd-fav-btn" onClick={handleFavorite}>
            <FaHeart className={isFav ? "bd-heart-filled" : "bd-heart-empty"} />
          </button>
        </div>

        <h1 className="bd-title">{book.title}</h1>
        <p className="bd-info">
          <strong>Author:</strong> {book.author}
        </p>
        <p className="bd-info">
          <strong>Version:</strong> {book.version}
        </p>
        <p className="bd-info">
          <strong>Description:</strong> {book.description}
        </p>
        <p className="bd-info">
          <strong>Category:</strong> {book.category}
        </p>
        <p className="bd-info">
          <strong>Status:</strong>{" "}
          {book.isBorrowed ? (
            <span className="bd-borrowed">Borrowed</span>
          ) : (
            <span className="bd-available">Available</span>
          )}
        </p>

        <button
          className={`bd-request-btn ${book.isBorrowed || isRequested ? "bd-request-btn-disabled" : ""}`}
          disabled={book.isBorrowed || isRequested}
          onClick={handleRequest}
        >
          {book.isBorrowed
            ? "Borrowed"
            : isRequested
              ? "Requested"
              : "Request Book"}
        </button>

        <div className="bd-reviews-section">
          <h3 className="bd-reviews-title">Reviews</h3>

          <div className="bd-reviews-list">
            {reviews.length === 0 ? (
              <p className="bd-no-reviews">No reviews yet. Be the first! 🌟</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} className="bd-review-card">
                  <div className="bd-review-header">
                    <span className="bd-review-name">
                      {r.userName || r.name}
                    </span>
                    <span className="bd-review-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FaStar
                          key={s}
                          color={s <= r.rating ? "#FFD700" : "#ddd"}
                          size={14}
                        />
                      ))}
                    </span>
                  </div>
                  <p className="bd-review-comment">
                    {r.comment || r.text}
                  </p>{" "}
                </div>
              ))
            )}
          </div>

          {auth.currentUser && userRole === "student" && (
            <div className="bd-review-form">
              <div className="bd-star-input">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar
                    key={s}
                    size={24}
                    color={s <= (hoverRating || rating) ? "#FFD700" : "#ddd"}
                    style={{ cursor: "pointer" }}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
              <textarea
                placeholder="Write a review..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bd-review-textarea"
              />
              <button
                className="bd-submit-btn"
                onClick={handleSubmitReview}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
