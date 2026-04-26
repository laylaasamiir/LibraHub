import React, { useState, useEffect } from 'react';
import { StuCard } from '../components/Stucard';
import { StuTable } from '../components/StuTable';
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./StudentProfile.css";
import { AdminCard } from '../components/AdminCard';

export const StudentProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

useEffect(() => {
    const fetchUserRole = async () => {
        if (auth.currentUser) {
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            if (userDoc.exists()) {
                setUserRole(userDoc.data().role);
            }
        }
    };
    fetchUserRole();
}, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="loader">Loading...</div>;

  
  if (!user) {
    return (
      <div className="guest-container">
        <div className="guest-card">
          <div className="guest-icon">📚</div>
          <h2>Welcome to LibraHub</h2>
          <p>It appears you are not logged in. Please log in to access your borrowed books and our full range of services.</p>
          <button className="login-btn" onClick={() => navigate("/login")}>
            login now          </button>
        </div>
      </div>
    );
  }

 
  if (role === 'admin') {
    return (
      <AdminCard/>
    );
  }


  return (
    <>
      <StuCard />
      <StuTable />
    </>
  );
};