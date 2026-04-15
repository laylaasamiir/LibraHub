import React, { useState } from "react";
import "./Borrow.css";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { FaUser, FaLock } from "react-icons/fa";
import { auth, db } from "../firebase";
import AdminRequests from '../components/AdminRequest';
 

 

const Borrow = () => {
  const [borrowData, setBorrowData] = useState({
    studentName: "",
    studentCode: "",
    bookCode: "",
  });

  const [messages, setMessage] = useState("");
  const [color, setColor] = useState("");

  const handleChange = (e) => {
    setBorrowData({ ...borrowData, [e.target.name]: e.target.value });
    setMessage("");
    setColor("");
  };

  const handleBorrow = async (e) => {
    e.preventDefault();

    try {
      const booksRef = collection(db, "books");
      const q = query(
        booksRef,
        where("bookId", "==", Number(borrowData.bookCode))
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setMessage("No book found with the provided code.");
        setColor("red");
        return;
      }

      const bookDoc = querySnapshot.docs[0];
      const bookData = bookDoc.data();

      if (bookData.isBorrowed === true) {
        setMessage("This book is already borrowed.");
        setColor("#ffc107");
        return;
      }

      await addDoc(collection(db, "borrowedBooks"), {
        studentName: borrowData.studentName,
        studentCode: borrowData.studentCode,
        bookCode: Number(borrowData.bookCode),
        bookDocId: bookDoc.id,
        bookTitle: bookData.title,
        borrowedAt: serverTimestamp(),
        status: "borrowed",
      });

      await updateDoc(doc(db, "books", bookDoc.id), {
        isBorrowed: true,
        borrowedByCode: borrowData.studentCode,
      });

      setMessage("Book borrowed successfully!");
      setColor("green");

      setBorrowData({
        studentName: "",
        studentCode: "",
        bookCode: "",
    });
    const [messages, setMessage] = useState("");
    const [color, setColor] = useState("");

    const handleChange = (e) => {
        setBorrowData({ ...borrowData, [e.target.name]: e.target.value });
        setMessage("");
        setColor("");
    };

    const handleBorrow = async (e) => {
        e.preventDefault();
        try {
            const booksRef = collection(db, "books");
            const q = query(booksRef, where("bookId", "==", Number(borrowData.bookCode)));
            const querySnapshot = await getDocs(q);
    
            if (querySnapshot.empty) {
                setMessage("This book does not exist ");
                return;
            }
    
            const bookDoc = querySnapshot.docs[0];
            const bookData = bookDoc.data();
    
            if (bookData.isBorrowed) {
                setMessage(" This book is currently borrowed");
                return;
            }
    
            
            await addDoc(collection(db, "borrowedBooks"), {
                studentName: borrowData.studentName,
                studentCode: borrowData.studentCode,
                userId: auth.currentUser.uid, 
                bookCode: Number(borrowData.bookCode),
                bookDocId: bookDoc.id, 
                bookTitle: bookData.title,
                borrowedAt: serverTimestamp(),  
                status: "borrowed",           
                returnedAt: null               
            });
    
          
            await updateDoc(doc(db, "books", bookDoc.id), {
                isBorrowed: true,
                borrowedByCode: borrowData.studentCode,
            });
    
            setMessage(" Borrowed successfully");
            setBorrowData({ studentName: "", studentCode: "", bookCode: "" });
        } catch (e) { console.error(e); }
    };
    const handleReturn = async () => {
        try {
            const booksRef = collection(db, "books");
            const qBook = query(booksRef, where("bookId", "==", Number(borrowData.bookCode)));
            const bookSnap = await getDocs(qBook);
    
            if (bookSnap.empty) {
                setMessage("This book does not exist");
                return;
            }
    
            const bookDoc = bookSnap.docs[0];
    
           
            const borrowQuery = query(
                collection(db, "borrowedBooks"),
                where("bookDocId", "==", bookDoc.id),
                where("status", "==", "borrowed"),
                where("studentCode", "==", borrowData.studentCode) 
            );
            
            const borrowSnapshot = await getDocs(borrowQuery);
            
            if (!borrowSnapshot.empty) {
                const activeDoc = borrowSnapshot.docs[0];
              
                await updateDoc(doc(db, "borrowedBooks", activeDoc.id), {
                    status: "returned",
                    returnedAt: serverTimestamp() 
                });
    
              
                await updateDoc(doc(db, "books", bookDoc.id), {
                    isBorrowed: false,
                    borrowedByCode: ""
                });
    
                setMessage(" Returned successfully");
            } else {
                setMessage(" Returned successful");
            }
            setBorrowData({ studentName: "", studentCode: "", bookCode: "" });
        } catch (e) { console.error(e); }
    };         
         



    return (
        <>
 


            <div className="borrow-page">
                <div className="borrow-card">
                    <h2>Borrow Book</h2>
                    {messages && (
                        <p style={{ color: color, fontWeight: "bold" }}>
                            {messages}
                        </p>
                    )}
                    <div className="card">
                        <label> Enter Student: </label>



                        <div className="input-box">
                            <FaUser className="icon" />
                            <input
                                type="text"
                                placeholder="Enter Student Name..."
                                name='studentName'
                                value={borrowData.studentName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="input-box">
                            <FaUser className="icon" />
                            <input
                                type="text"
                                placeholder="Enter Student code..."
                                name='studentCode'
                                value={borrowData.studentCode}
                                onChange={handleChange}
                            />
                        </div>

                    </div>
                    <label>Enter Book Copy ID:</label>
                    <div className='input-box'>
                        <FaLock className="icon" />

                        <input
                            type="text"
                            placeholder="Enter Book Code..."
                            name='bookCode'
                            value={borrowData.bookCode}
                            onChange={handleChange}
                        />
                    </div>


                    <br />
                    <div className="buttons">
                        <button className="confirm" onClick={handleBorrow}>Confirm Borrow</button>
                        <button className="return" onClick={handleReturn}>Return</button>
                    </div>
                </div>
            </div>

            <div className="input-box">
              <FaUser className="icon" />
              <input
                type="text"
                placeholder="Enter Student code..."
                name="studentCode"
                value={borrowData.studentCode}
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Enter Book Copy ID:</label>

          <div className="input-box">
            <FaLock className="icon" />
            <input
              type="text"
              placeholder="Enter Book Code..."
              name="bookCode"
              value={borrowData.bookCode}
              onChange={handleChange}
            />
          </div>

          <div className="buttons">
            <button className="confirm" onClick={handleBorrow}>
              Confirm Borrow
            </button>
            <button className="return" onClick={handleReturn}>
              Return
            </button>
          </div>
        </div>
      </div>

      <AdminRequests />
    </div>
  );
};

export default Borrow;