import React, { useState, useEffect } from 'react';
import '../Pages/StudentProfile.css';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"; 
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";  
import { onSnapshot } from "firebase/firestore";  

export const StuTable = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setBooks([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "borrowedBooks"),
        where("userId", "==", user.uid),
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

  if (loading) return <p style={{ textAlign: "center", padding: "20px" }} >Loading borrowing history...</p>;

  return (
    <div className="pc-card">
      <table className="loans-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Book Title</th>
            <th>Borrow Date</th>
            <th>Return Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.bookTitle}</td>
                <td>
                  {item.borrowedAt?.toDate 
                    ? item.borrowedAt.toDate().toLocaleString() 
                    : "Waiting..."}
                </td>

                <td>
                  {item.status === "returned" 
                    ? (item.returnedAt?.toDate ? item.returnedAt.toDate().toLocaleString() : "Returned") 
                    : <span style={{ color: 'orange', fontWeight: 'bold' }}>Borrowed</span>}
                </td>
                
                <td>
                  <span className={`status-badge ${item.status}`}>
                    {item.status === "returned" ? "Returned" : "Borrowed"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: "20px" }}>
                No borrowing history 
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}