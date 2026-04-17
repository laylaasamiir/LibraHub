import React, { useState, useEffect } from 'react';
import '../Pages/StudentProfile.css';
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"; 
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";  
import { onSnapshot } from "firebase/firestore";  

export const StuTable = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowDuration, setBorrowDuration] = useState(7);
  const fetchSettings = async () => {
  const docRef = doc(db, "settings", "libraryConfig");
  const docSnap = await getDocs(collection(db, "settings"));
  if (!docSnap.empty) {
    const config = docSnap.docs.find(d => d.id === "libraryConfig");
    if (config) setBorrowDuration(config.data().borrowDuration);
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

const calculateFine = (borrowedAt, returnAt) => {
  if (!borrowedAt) return { dueDate: "N/A", fine: 0 };
  const borrowDate = borrowedAt.toDate();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(borrowDate.getDate() + Number(borrowDuration));
  const compareDate = returnAt ? (returnAt.toDate ? returnAt.toDate() : new Date(returnAt)) : new Date();
  compareDate.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  if (compareDate > dueDate) {
    const diffTime = Math.abs(compareDate - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { dueDate: dueDate.toLocaleDateString(), fine: diffDays * 50 };
  }
  return { dueDate: dueDate.toLocaleDateString(), fine: 0 };
};

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
            <th>Due Date</th>
            <th>Fine</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {books.length > 0 ? (
            books.map((item, index) => {
              const { dueDate, fine } = calculateFine(item.borrowedAt, item.returnAt || item.returnAtAt);
              return(
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
                <td>{dueDate}</td>
                <td style={{ color: fine > 0 ? "red" : "black", fontWeight: fine > 0 ? "bold" : "normal" }}>
                  {fine} EGP
                </td>
                <td>
                  <span className={`status-badge ${item.status}`}>
                    {item.status === "returned" ? "Returned" : "Borrowed"}
                  </span>
                </td>
              </tr>
            );
              })
            
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: "20px" }}>
                No borrowing history 
              </td>
            </tr>
          )}  
        </tbody>
      </table>
    </div>
    );
};
  