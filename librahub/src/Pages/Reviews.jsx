import { useState, useEffect } from "react";
import "./Reviews.css";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  where,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ReviewsSidebar({ isOpen, setIsOpen }) {
  const [reviews, setReviews] = useState("");
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [pendingReviewData, setPendingReviewData] = useState(null);
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const ratedReviews = submittedReviews.filter((r) => r.rating);

  const averageRating =
    ratedReviews.length > 0
      ? ratedReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
        ratedReviews.length
      : 0;

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubmittedReviews(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    setErrorMsg("");

    if (!auth.currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (!reviews.trim()) {
      setErrorMsg("Please write a review first.");
      return;
    }

    if (rating === 0) {
      setErrorMsg("Please add a rating before submitting.");
      return;
    }

    await auth.currentUser.reload();

    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    const reviewData = {
      text: reviews,
      rating,
      name: userData?.name || auth.currentUser?.email || "Anonymous",
      userId: auth.currentUser.uid,
      updatedAt: serverTimestamp(),
    };

    const existingReviewQuery = query(
      collection(db, "reviews"),
      where("userId", "==", auth.currentUser.uid),
    );

    const existingReviewSnap = await getDocs(existingReviewQuery);

    if (!existingReviewSnap.empty) {
      const existingReviewDoc = existingReviewSnap.docs[0];

      setPendingReviewData(reviewData);
      setExistingReviewId(existingReviewDoc.id);
      setShowUpdateModal(true);
      return;
    }

    await addDoc(collection(db, "reviews"), {
      ...reviewData,
      createdAt: serverTimestamp(),
    });

    setReviews("");
    setRating(0);
    setErrorMsg("");
  };

  const handleUpdateReview = async () => {
    if (!existingReviewId || !pendingReviewData) return;

    await updateDoc(doc(db, "reviews", existingReviewId), pendingReviewData);

    setShowUpdateModal(false);
    setPendingReviewData(null);
    setExistingReviewId(null);
    setReviews("");
    setRating(0);
    setErrorMsg("");
  };

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

            <div className="guest-icon">⭐</div>
            <h2>Login Required</h2>
            <p>To write a review, you must be logged in first.</p>

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
              You already submitted a review. Do you want to update your rating
              and comment?
            </p>

            <button className="login-btn" onClick={handleUpdateReview}>
              Update Review
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="reviews-overlay" onClick={() => setIsOpen(false)} />
      )}

      <div
        className={`sidebar ${isOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>User reviews</h2>

        <div className="site-rating-summary">
          <div className="site-rating-stars">
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
            {ratedReviews.length} 👥)
          </span>
        </div>

        <div className="reviews-list">
          {submittedReviews.map((review) => (
            <div className="review" key={review.id}>
              <div className="review-header">
                <h4 className="user-name">
                  {review.name || review.userName || "Anonymous"}
                </h4>

                {review.bookTitle && (
                  <span className="book-badge">Book: {review.bookTitle}</span>
                )}
              </div>

              {review.rating && (
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar
                      key={s}
                      size={14}
                      color={s <= review.rating ? "#FFD700" : "#ddd"}
                    />
                  ))}
                </div>
              )}

              <p className="review-text">{review.comment || review.text}</p>

              {review.createdAt && (
                <span className="review-date">
                  {review.createdAt.seconds
                    ? new Date(
                        review.createdAt.seconds * 1000,
                      ).toLocaleDateString()
                    : "Just now"}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="review-stars-input">
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

        {errorMsg && <p className="review-error">{errorMsg}</p>}

        <textarea
          value={reviews}
          onChange={(e) => {
            setReviews(e.target.value);
            setErrorMsg("");
          }}
          placeholder="Write a review..."
        />

        <button onClick={handleSubmit}>Submit</button>
      </div>
    </>
  );
}
