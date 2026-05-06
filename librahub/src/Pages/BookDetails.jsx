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
        where("bookId", "==", book.id)
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
        where("status", "==", "pending")
      );
      const reqSnap = await getDocs(reqQ);
      if (!reqSnap.empty) setIsRequested(true);

      const revQ = query(
        collection(db, "reviews"),
        where("bookId", "==", book.id)
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

    const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));

    await addDoc(collection(db, "borrowRequests"), {
      studentId: auth.currentUser.uid,
      studentName: userSnap.data().fullName || "",
      studentEmail: userSnap.data().email || "",
      bookId: book.id,
      bookTitle: book.title,
      status: "pending",
      requestedAt: serverTimestamp(),
    });

    setIsRequested(true);
  };

  const handleSubmitReview = async () => {
    if (!comment || rating === 0) return;

    const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));

    const newReview = {
      bookId: book.id,
      bookTitle: book.title,
      userId: auth.currentUser.uid,
      userName: userSnap.data().fullName,
      comment,
      rating,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "reviews"), newReview);
    setReviews((prev) => [...prev, { id: docRef.id, ...newReview }]);

    setComment("");
    setRating(0);
  };

  if (!book) return <h2>Book not found</h2>;

  return (
    <div className="bd-container">
      <div className="bd-card">
        <img
          src={book.coverUrl || book.image}
          alt="book"
          className="bd-image"
        />

        <h1>{book.title}</h1>
        <p>{book.author}</p>
        <p>{book.description}</p>

        <button onClick={handleFavorite}>
          <FaHeart color={isFav ? "red" : "gray"} />
        </button>

        <button onClick={handleRequest} disabled={isRequested || book.isBorrowed}>
          {isRequested ? "Requested" : "Request Book"}
        </button>

        <div>
          <h3>Reviews</h3>

          {reviews.map((r) => (
            <div key={r.id}>
              <p>{r.userName}</p>
              <p>{r.comment}</p>
            </div>
          ))}

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div>
            {[1,2,3,4,5].map((s) => (
              <FaStar
                key={s}
                color={s <= rating ? "gold" : "gray"}
                onClick={() => setRating(s)}
              />
            ))}
          </div>

          <button onClick={handleSubmitReview}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;