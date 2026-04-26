import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { auth, db } from "../firebase"; 
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./Layout.css";

const Header = () => {
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
   
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        
        const userDocRef = doc(db, "users", user.uid);
        const unsubData = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setAvatarUrl(docSnap.data().avatarUrl);
          }
        });
        return () => unsubData();
      } else {
        setAvatarUrl(null);
      }
    });

    return () => unsubAuth();
  }, []);

  return (
    <header className="top-header">
      <div className="logo">LibraHub 📚</div>

      <Link to="/StudentProfile" className="profile-icon-link">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="Profile" 
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #fff"
            }} 
          />
        ) : (
          <FaUserCircle size={30} />
        )}
      </Link>
    </header>
  );
};

export default Header;