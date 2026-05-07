import React, { useState, useEffect } from 'react';
import '../Pages/StudentProfile.css';
import { collection, query, where, orderBy, onSnapshot, doc, getDocs } from "firebase/firestore"; 
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";  

export const StuTable = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowDuration, setBorrowDuration] = useState(7);
  const [dailyFine, setDailyFine] = useState(30);

  const fetchSettings = async () => {
    const docSnap = await getDocs(collection(db, "settings"));
    if (!docSnap.empty) {
      const config = docSnap.docs.find(d => d.id === "libraryConfig");
      if (config) setBorrowDuration(config.data().borrowDuration);
      if(config)setDailyFine(config.data().dailyFine || 30);
    }
  };

  useEffect(() => {
    fetchSettings();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setBooks([]);
        setLoading(false);
        return;
      }

      
      const q = query(
        collection(db, "borrowedBooks"),
        where("studentId", "==", user.uid),
        where("status", "==", "borrowed"), 
        orderBy("borrowedAt", "desc")
      );

      const unsubscribeSnap = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(data);
        setLoading(false);
      }, (error) => {
        console.error("Firebase Error: ", error);
        setLoading(false);
      });

      return () => unsubscribeSnap();
    });

    return () => unsubscribeAuth();  
  }, []);

  const calculateFine = (borrowedAt) => {
    if (!borrowedAt) return { dueDate: "N/A", fine: 0 };
    const borrowDate = borrowedAt.toDate();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(borrowDate.getDate() + Number(borrowDuration));
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    if (today > dueDate) {
      const diffTime = Math.abs(today - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { dueDate: dueDate.toLocaleDateString(), fine: diffDays * Number(dailyFine) };
    }
    return { dueDate: dueDate.toLocaleDateString(), fine: 0 };
  };


  const formatDateTime = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return "Waiting...";
    const dateObj = timestamp.toDate();
    return (
      <div style={{ fontSize: "0.9rem", lineHeight: "1.2" }}>
        <div>{dateObj.toLocaleDateString()}</div>
        <div style={{ color: "#666", fontSize: "0.8rem" }}>{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    );
  };

  if (loading) return <p style={{ textAlign: "center", padding: "20px" }}>Loading currently borrowed books...</p>;

  return (
    <div className="pc-card">
      <h3 style={{ padding: "10px 20px", margin: 0 }}>Current Loans</h3>
      <table className="loans-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Book Title</th>
            <th>Borrow Date</th>
            <th>Due Date</th>
            <th>Fine</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((item, index) => {
              const { dueDate, fine } = calculateFine(item.borrowedAt);
              return (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: "500" }}>{item.bookTitle}</td>
                  <td>{formatDateTime(item.borrowedAt)}</td>
                  <td>{dueDate}</td>
                  <td style={{ color: fine > 0 ? "red" : "black", fontWeight: fine > 0 ? "bold" : "normal" }}>
                    {fine} EGP
                  </td>
                  <td>
                    <span className="status-badge borrowed" style={{ background: "#fff3e0", color: "#ef6c00", padding: "4px 8px", borderRadius: "4px", fontSize: "0.85rem" }}>
                      Borrowed
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: "40px" }}>
                No active borrowed books.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};