import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import "./AdminRequest.css";

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [requestStats, setRequestStats] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [sortByCount, setSortByCount] = useState(false);
  const [loading, setLoading] = useState(true);

  const enrichRequest = useCallback(async (item) => {
    const req = item.data();
    let studentCode = "No Code";
    let realBookCode = "No Code";
    let bookTitle = req.bookTitle || "Unknown Book";

    if (req.studentId) {
      try {
        const userSnap = await getDoc(doc(db, "users", req.studentId));
        if (userSnap.exists()) {
          const u = userSnap.data();
          studentCode = u.studentCode || u.code || "No Code";
        }
      } catch (_) {}
    }

    if (req.bookId) {
      try {
        const bookSnap = await getDoc(doc(db, "books", req.bookId));
        if (bookSnap.exists()) {
          const b = bookSnap.data();
          realBookCode = b.bookId || b.code || "No Code";
          bookTitle = b.title || b.bookTitle || bookTitle;
        }
      } catch (_) {}
    }

    return { id: item.id, ...req, studentCode, realBookCode, bookTitle };
  }, []);

  useEffect(() => {
    setLoading(true);

    const q = query(
      collection(db, "borrowRequests"),
      orderBy("requestedAt", "desc"),
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const pendingDocs = snapshot.docs.filter(
        (d) => d.data().status === "pending",
      );

      const enriched = await Promise.all(pendingDocs.map(enrichRequest));

      const stats = {};
      enriched.forEach((req) => {
        const code = req.realBookCode || "No Code";
        const title = req.bookTitle || "Unknown Book";
        if (!stats[code]) {
          stats[code] = { bookCode: code, bookTitle: title, count: 0 };
        }
        stats[code].count += 1;
      });

      setRequestStats(Object.values(stats).sort((a, b) => b.count - a.count));
      setRequests(enriched);
      setLoading(false);
    });

    return () => unsub();
  }, [enrichRequest]);

  const handleApprove = async (req) => {
    try {
      const bookRef = doc(db, "books", req.bookId);
      const bookSnap = await getDoc(bookRef);

      if (!bookSnap.exists()) {
        alert("Book not found.");
        return;
      }

      const bookData = bookSnap.data();

      if (bookData.isBorrowed) {
        alert("This book is already borrowed.");
        await updateDoc(doc(db, "borrowRequests", req.id), {
          status: "rejected",
          rejectedAt: serverTimestamp(),
          adminNote: "Book already borrowed",
          seenByUser: false,
        });
        return;
      }

      await updateDoc(bookRef, {
        isBorrowed: true,
        borrowedByCode: req.studentCode || "",
      });

      await addDoc(collection(db, "borrowedBooks"), {
        studentId: req.studentId,
        studentName: req.studentName || "",
        studentEmail: req.studentEmail || "",
        studentCode: req.studentCode || "",
        bookId: req.bookId,
        bookCode: req.realBookCode || "",
        bookTitle: req.bookTitle || "",
        borrowedAt: serverTimestamp(),
        status: "borrowed",
      });

      await updateDoc(doc(db, "borrowRequests", req.id), {
        status: "approved",
        approvedAt: serverTimestamp(),
        seenByUser: false,
      });
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (req) => {
    try {
      await updateDoc(doc(db, "borrowRequests", req.id), {
        status: "rejected",
        rejectedAt: serverTimestamp(),
        seenByUser: false,
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const filtered = requests.filter((req) => {
    if (!filterText) return true;
    const text = filterText.toLowerCase();
    return (
      String(req.realBookCode || "")
        .toLowerCase()
        .includes(text) ||
      String(req.bookTitle || "")
        .toLowerCase()
        .includes(text)
    );
  });

  const displayed = sortByCount
    ? [...filtered].sort((a, b) => {
        const countA =
          requestStats.find((s) => s.bookCode === a.realBookCode)?.count || 0;
        const countB =
          requestStats.find((s) => s.bookCode === b.realBookCode)?.count || 0;
        return countB - countA;
      })
    : filtered;

  return (
    <div className="requests-page">
      <h2>Borrow Requests</h2>

      <div className="requests-controls">
        <input
          className="request-filter-input"
          placeholder="Filter by book name or code..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />

        <button
          className={`sort-btn ${sortByCount ? "active" : ""}`}
          onClick={() => setSortByCount((prev) => !prev)}
          title="Sort by most requested book"
        >
          {sortByCount ? "📊 Sorted by Requests" : "⇅ Sort by Requests"}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
          Loading...
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
          <div style={{ fontSize: "60px" }}>📭</div>
          <h3 style={{ marginTop: "16px", color: "#555" }}>
            No pending requests
          </h3>
          <p style={{ fontSize: "14px" }}>
            All caught up! No borrow requests at the moment.
          </p>
        </div>
      ) : (
        <div className="requests-list">
          <div className="request-row header">
            <span>Student Code</span>
            <span>Book Title</span>
            <span>Book Code</span>
            <span>Requests</span>
            <span>Action</span>
          </div>

          {displayed.map((req) => {
            const bookStat = requestStats.find(
              (s) => s.bookCode === req.realBookCode,
            );
            return (
              <div className="request-row" key={req.id}>
                <span>{req.studentCode}</span>
                <span>{req.bookTitle}</span>
                <span>{req.realBookCode}</span>
                <span className="count-badge">{bookStat?.count ?? 1}</span>
                <div className="actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(req)}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject(req)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
