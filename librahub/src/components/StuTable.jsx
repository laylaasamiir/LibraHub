import React, { useEffect, useState } from 'react'
import '../Pages/StudentProfile.css'
import { collection, getDocs, query, where } from "firebase/firestore"; 
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";  

export const StuTable = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(
            collection(db, "borrowedBooks"),
            where("userId", "==", user.uid)  
          );

          const querySnapshot = await getDocs(q);

          const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setBooks(data);

        } catch (error) {
          console.error("Error fetching books:", error);
        } finally {
          setLoading(false);
        }

      } else {
        setBooks([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <p>Loading...</p>;

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
          {books.length === 0 ? (
            <tr>
              <td colSpan="5">No books borrowed yet</td>
            </tr>
          ) : (
            books.map((book, index) => (
              <tr key={book.id}>
                <td>{index + 1}</td>
                <td>{book.bookTitle}</td>

                <td>
                  {book.borrowedAt?.seconds
                    ? new Date(book.borrowedAt.seconds * 1000).toLocaleString()
                    : "-"}
                </td>

                <td>
                  {book.returnedAt?.seconds
                    ? new Date(book.returnedAt.seconds * 1000).toLocaleString()
                    : "Not returned"}
                </td>

                <td>{book.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}