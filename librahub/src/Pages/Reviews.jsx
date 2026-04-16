import { useState } from "react";
import "./Reviews.css";

export default function ReviewsSidebar() {
  const [reviews, setReviews] = useState("");
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>

      <button className="toggle-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Close Reviews" : "Open Reviews"}
      </button>

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <h2>Reviews</h2>

        <div className="reviews-list">
          {submittedReviews.map((review, index) => (
            <div className="review" key={index}>
              <p>{review}</p>
            </div>
          ))}
        </div>

        <textarea
          value={reviews}
          onChange={(e) => setReviews(e.target.value)}
          placeholder="Write a review..."
        />
        <button
          onClick={() => {
            if (!reviews.trim()) return;
            setSubmittedReviews([...submittedReviews, reviews]);
            setReviews("");
          }}
        >
          Submit
        </button>
      </div>
    </>
  );
}
