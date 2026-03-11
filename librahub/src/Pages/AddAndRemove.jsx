import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import './StudentProfile.css';

export const AddAndRemove = () => {

  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "admin"));

    const unsub = onSnapshot(q, (snapshot) => {
      const adminsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAdmins(adminsData);
    });

    return () => unsub();
  }, []);

const handleRemove = async (id) => {
  try {
    await deleteDoc(doc(db, "users", id));
  } catch (error) {
    console.error("Error removing admin:", error);
  }
};

  return (
    <div className="table-container">
      <table className="borrow-table">
        <caption style={{backgroundColor: "#3498db", color: "white", padding: "8px", fontSize: "18px", borderRadius:"6px"}}>
          Admins
        </caption>
        <thead style={{backgroundColor: "#3498db", color:"white"}}>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>{admin.name}</td>
              <td>{admin.email}</td>
              <td style={{textAlign:'center'}}>
                <button onClick={() => handleRemove(admin.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/admin/admin-register">
        <button className="add-admin" title="Add New Admin">+</button>
      </Link>
    </div>
  );
};