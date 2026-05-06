import { useState, useEffect } from "react";
import "./Reviews.css";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";

<<<<<<< HEAD
export default function ReviewsSidebar() {
  const [reviews, setReviews] = useState("");
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
=======
export default function ReviewsSidebar({ isOpen, setIsOpen })  {
  const [reviews, setReviews] = useState("");
  const [submittedReviews, setSubmittedReviews] = useState([]);
  
>>>>>>> 53ed599c35bd6a2a76c06dfca42055977034cecc

  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubmittedReviews(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!reviews.trim()) return;
    await auth.currentUser.reload();

    await addDoc(collection(db, "reviews"), {
      text: reviews,
      name: auth.currentUser?.displayName || "Anonymous",
      createdAt: new Date()
  });

    setReviews("");
  };

  return (
    <>
<<<<<<< HEAD
      <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Close Reviews" : "Open Reviews"}
      </button>
=======
>>>>>>> 53ed599c35bd6a2a76c06dfca42055977034cecc

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2>Reviews</h2>

        <div className="reviews-list">
          {submittedReviews.map((review) => (
            <div className="review" key={review.id}>
              <h4>{review.name}</h4>
              <p>{review.text}</p>
            </div>
          ))}
        </div>

        <textarea
          value={reviews}
          onChange={(e) => setReviews(e.target.value)}
          placeholder="Write a review..."
        />

        <button onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </>
  );
}
