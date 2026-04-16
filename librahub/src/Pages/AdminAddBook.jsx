import { Link } from "react-router-dom";
import "./AdminAddBook.css";

export default function AdminAddBook() {
  return (
    <div className="admin-add-wrapper">
      <div className="admin-add-container">
        <div className="admin-add-title">📚 Add New Book</div>

        <div className="admin-choose-container">
          <Link to="/AiAddBook" className="admin-ai-btn">
            🤖 Scan with AI
            <span>Take a photo of the book cover</span>
          </Link>

          <Link to="/AddBook" className="admin-manual-btn">
            ✏️ Add Manually
            <span>Enter book details yourself</span>
          </Link>
        </div>
      </div>
    </div>
  );
}