import React, { useEffect, useState } from "react";
import "../Pages/StudentProfile.css";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; 

export const StuCard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setUserData(null);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData(snap.data());
        else setUserData(null);
      } catch (err) {
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (!loading && !userData) {
    return (
      <div className="pc-card">
        <h2 className="pc-title">Profile</h2>
        <div className="pc-table">
          <div className="pc-row">
            <div className="pc-label">Status:</div>
            <div className="pc-value">No profile data found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pc-card">
      <h2 className="pc-title">Profile</h2>

      <div className="pc-table">
        <div className="pc-row">
          <div className="pc-label">Email:</div>
          <div className="pc-value">
            {loading ? "Loading..." : userData?.email || "N/A"}
          </div>
        </div>

        <div className="pc-row">
          <div className="pc-label">Department:</div>
          <div className="pc-value">
            {loading ? "Loading..." : userData?.department || "N/A"}
          </div>
        </div>

        <div className="pc-row">
          <div className="pc-label">Level:</div>
          <div className="pc-value">
            {loading ? "Loading..." : userData?.level || "N/A"}
          </div>
        </div>
      </div>

      <div className="pc-actions">
        <button className="pc-btn">Fine Details</button>
      </div>
    </div>
  );
};