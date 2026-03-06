import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import '../Pages/login.css'


export const Complete = () => {

  const [level, setLevel] = useState("");
  const [department, setDepartment] = useState("");

  const navigate = useNavigate();

  const handleComplete = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) return;

    try {

      await updateDoc(doc(db, "users", user.uid), {
        department: department,
        level: level,
      });

      navigate("/StudentProfile");

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <form className="login-form" onSubmit={handleComplete}>
        <h2 className="login-title">Complete Your Profile</h2>

        <label className="login-label">Department</label>
        <input
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="login-input"
        />

        <label className="login-label">Level</label>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="login-input"
        >
          <option value="">Choose Level</option>
          <option value="1">Level 1</option>
          <option value="2">Level 2</option>
          <option value="3">Level 3</option>
          <option value="4">Level 4</option>
        </select>

        <button className="login-button">
          Save
        </button>

      </form>
    </>
  );
};