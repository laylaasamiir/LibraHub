import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "./AdminRequest.css";

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const q = query(
        collection(db, "borrowRequests"),
        orderBy("requestedAt", "desc")
      );

      const snapshot = await getDocs(q);

      const requestsData = await Promise.all(
        snapshot.docs.map(async (item) => {
          const req = item.data();

          let studentCode = "No Code";
          let realBookCode = "No Code";

          if (req.studentId) {
            const userRef = doc(db, "users", req.studentId);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const userData = userSnap.data();
              studentCode = userData.studentCode || userData.code || "No Code";
            }
          }

          if (req.bookId) {
            const bookRef = doc(db, "books", req.bookId);
            const bookSnap = await getDoc(bookRef);

            if (bookSnap.exists()) {
              const bookData = bookSnap.data();
              realBookCode = bookData.bookId || "No Code";
            }
          }

          return {
            id: item.id,
            ...req,
            studentCode,
            realBookCode,
          };
        })
      );

      setRequests(requestsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (req) => {
    try {
    
      await updateDoc(doc(db, "borrowRequests", req.id), {
        status: "approved",
        approvedAt: serverTimestamp(),
      });

      
      await updateDoc(doc(db, "books", req.bookId), {
        isBorrowed: true,
        borrowedByCode: req.studentCode || "",
      });

     
      await addDoc(collection(db, "borrowedBooks"), {
        studentId: req.studentId,
        studentName: req.studentName || "",
        studentEmail: req.studentEmail || "",
        studentCode: req.studentCode || "",
        bookId: req.bookId, // document id
        bookCode: req.realBookCode || "", // numeric/real code
        bookTitle: req.bookTitle || "",
        borrowedAt: serverTimestamp(),
        status: "borrowed",
      });

      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (req) => {
    try {
      await updateDoc(doc(db, "borrowRequests", req.id), {
        status: "rejected",
        rejectedAt: serverTimestamp(),
      });

      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="requests-page">
      <h2>Borrow Requests</h2>

      <div className="requests-list">
        <div className="request-row header">
          <span>Student Code</span>
          <span>Book Code</span>
          <span>Status</span>
          <span>Action</span>
        </div>

        {requests.map((req) => (
          <div className="request-row" key={req.id}>
            <span>{req.studentCode}</span>
            <span>{req.realBookCode}</span>
            <span>{req.status}</span>

            <div className="actions">
              {req.status === "pending" ? (
                <>
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
                </>
              ) : (
                <span className="done-text">Done</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRequests;