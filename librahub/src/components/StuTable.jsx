import React, { useEffect, useState } from "react";
import "../Pages/StudentProfile.css";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const StuTable = () => {
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
    <div className="table-container" style={{ padding: "20px" }}>
      <table className="stu-table">
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
                    : "wating.."}
                </td>
                
                
                <td>
                  {item.status === "returned" 
                    ? (item.returnedAt?.toDate ? item.returnedAt.toDate().toLocaleString() : "Returned") 
                    : <span style={{ color: 'orange', fontWeight: 'bold' }}>Borrowed</span>}
                </td>
                
                
                <td>
                  <span className={`status-badge ${item.status}`}>
                    {item.status === "returned" ? "returned" : "borrowed"}
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
};

export default StuTable;