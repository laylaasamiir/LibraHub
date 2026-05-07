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
  updateDoc,
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
  const [borrowCount, setBorrowCount] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [pendingReviewData, setPendingReviewData] = useState(null);
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const ratedReviews = reviews.filter((r) => r.rating);

  const averageRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        ratedReviews.length
      : 0;

  useEffect(() => {
    const fetchData = async () => {
      if (!book) return;

      const borrowedSnap = await getDocs(
        query(collection(db, "borrowedBooks"), where("bookId", "==", book.id)),
      );
      setBorrowCount(borrowedSnap.size);

      if (auth.currentUser) {
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
      }

      const revQ = query(
        collection(db, "bookReviews"),
        where("bookId", "==", book.id),
      );

      const revSnap = await getDocs(revQ);
      setReviews(revSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    fetchData();
  }, [book]);

  const handleFavorite = async () => {
    if (!auth.currentUser || userRole !== "student") {
      setShowAuthModal(true);
      return;
    }

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
    if (!auth.currentUser || userRole !== "student") {
      setShowAuthModal(true);
      return;
    }

    if (isRequested || book.isBorrowed) return;

    try {
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const studentData = userSnap.data();

      await addDoc(collection(db, "borrowRequests"), {
        studentId: auth.currentUser.uid,
        studentName: studentData.name || "",
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
    setErrorMsg("");

    if (!auth.currentUser || userRole !== "student") {
      setShowAuthModal(true);
      return;
    }

    if (!comment.trim()) {
      setErrorMsg("Please write a review first.");
      return;
    }

    if (rating === 0) {
      setErrorMsg("Please add a rating before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userName = userSnap.data()?.name || "Anonymous";

      const reviewData = {
        bookId: book.id,
        bookTitle: book.title,
        userId: auth.currentUser.uid,
        userName,
        comment,
        rating,
        updatedAt: serverTimestamp(),
      };

      const existingReviewQuery = query(
        collection(db, "bookReviews"),
        where("bookId", "==", book.id),
        where("userId", "==", auth.currentUser.uid),
      );

      const existingReviewSnap = await getDocs(existingReviewQuery);

      if (!existingReviewSnap.empty) {
        const existingReviewDoc = existingReviewSnap.docs[0];

        setPendingReviewData(reviewData);
        setExistingReviewId(existingReviewDoc.id);
        setShowUpdateModal(true);
        setSubmitting(false);
        return;
      }

      const newReview = {
        ...reviewData,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "bookReviews"), newReview);

      setReviews((prev) => [...prev, { id: docRef.id, ...newReview }]);
      setComment("");
      setRating(0);
    } catch (error) {
      console.error(error);
    }

    setSubmitting(false);
  };

  const handleUpdateReview = async () => {
    if (!existingReviewId || !pendingReviewData) return;

    await updateDoc(
      doc(db, "bookReviews", existingReviewId),
      pendingReviewData,
    );

    setReviews((prev) =>
      prev.map((review) =>
        review.id === existingReviewId
          ? { ...review, ...pendingReviewData }
          : review,
      ),
    );

    setShowUpdateModal(false);
    setPendingReviewData(null);
    setExistingReviewId(null);
    setComment("");
    setRating(0);
    setErrorMsg("");
  };

  if (!book) return <h2>Book not found</h2>;

  return (
    <>
      {showAuthModal && (
        <div
          className="auth-modal-overlay"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="guest-card auth-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal-btn"
              onClick={() => setShowAuthModal(false)}
            >
              ×
            </button>
            <div className="guest-icon">📚</div>
            <h2>Student Access Only</h2>
            <p>
              To request books, add favorites, or write reviews, you must be
              logged in with a Student account.
            </p>
            <button className="login-btn" onClick={() => navigate("/login")}>
              Login Now
            </button>
          </div>
        </div>
      )}

      {showUpdateModal && (
        <div
          className="auth-modal-overlay"
          onClick={() => setShowUpdateModal(false)}
        >
          <div
            className="guest-card auth-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal-btn"
              onClick={() => setShowUpdateModal(false)}
            >
              ×
            </button>
            <div className="guest-icon">✏️</div>
            <h2>Update Review?</h2>
            <p>
              You already submitted a review for this book. Do you want to
              update your rating and comment?
            </p>
            <button className="login-btn" onClick={handleUpdateReview}>
              Update Review
            </button>
          </div>
        </div>
      )}

      <div className="book-det-container">
        <div className="book-det-card">
          <div className="book-det-header">
            <img
              src={
                book.coverUrl || book.image || "https://placehold.co/150x200"
              }
              alt="book"
              onError={(e) => {
                e.target.src = "https://placehold.co/150x200";
              }}
              className="book-det-image"
            />

            <button className="book-det-fav-btn" onClick={handleFavorite}>
              <FaHeart
                className={
                  isFav ? "book-det-heart-filled" : "book-det-heart-empty"
                }
              />
            </button>

            {borrowCount > 0 && (
              <div className="book-det-borrow-badge">📖 {borrowCount}</div>
            )}
          </div>

          <h1 className="book-det-title">{book.title}</h1>

          <p className="book-det-info">
            <strong>Author:</strong> {book.author}
          </p>
          <p className="book-det-info">
            <strong>Version:</strong> {book.version}
          </p>
          <p className="book-det-info">
            <strong>Description:</strong> {book.description}
          </p>
          <p className="book-det-info">
            <strong>Category:</strong> {book.category}
          </p>

          <p className="book-det-info">
            <strong>Status:</strong>{" "}
            {book.isBorrowed ? (
              <span className="book-det-borrowed">Borrowed</span>
            ) : (
              <span className="book-det-available">Available</span>
            )}
          </p>

          <button
            className={`book-det-request-btn ${book.isBorrowed || isRequested ? "book-det-request-btn-disabled" : ""}`}
            disabled={book.isBorrowed || isRequested}
            onClick={handleRequest}
          >
            {book.isBorrowed
              ? "Borrowed"
              : isRequested
                ? "Requested"
                : "Request Book"}
          </button>

          <div className="book-det-reviews-section">
            <h3 className="book-det-reviews-title">Book Reviews</h3>

            <div className="book-det-rating-summary">
              <div className="book-det-rating-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar
                    key={s}
                    size={18}
                    color={s <= Math.round(averageRating) ? "#FFD700" : "#ddd"}
                  />
                ))}
              </div>
              <span>
                {averageRating ? averageRating.toFixed(1) : "0.0"} / 5 (
                {ratedReviews.length} reviews)
              </span>
            </div>

            <div className="book-det-reviews-list">
              {reviews.length === 0 ? (
                <p className="book-det-no-reviews">
                  No reviews yet. Be the first! 🌟
                </p>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="book-det-review-card">
                    <div className="book-det-review-header">
                      <span className="book-det-review-name">
                        {r.userName || r.name || "Anonymous"}
                      </span>
                      <span className="book-det-review-stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FaStar
                            key={s}
                            color={s <= r.rating ? "#FFD700" : "#ddd"}
                            size={14}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="book-det-review-comment">
                      {r.comment || r.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {auth.currentUser && userRole === "student" ? (
              <div className="book-det-review-form">
                <div className="book-det-star-input">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar
                      key={s}
                      size={24}
                      color={s <= (hoverRating || rating) ? "#FFD700" : "#ddd"}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setRating(s);
                        setErrorMsg("");
                      }}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>

                {errorMsg && (
                  <p className="book-det-review-error">{errorMsg}</p>
                )}

                <textarea
                  placeholder="Write a review..."
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    setErrorMsg("");
                  }}
                  className="book-det-review-textarea"
                />

                <button
                  className="book-det-submit-btn"
                  onClick={handleSubmitReview}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            ) : (
              <div className="book-det-login-review-box">
                <p>You need to login as a student to write a review.</p>
                <button onClick={() => setShowAuthModal(true)}>
                  Login to Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BookDetails;
