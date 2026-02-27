import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import '../Pages/login.css'
import { Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState();
  const [department, setDepartment] = useState("");

  const handleRegister = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        name,
        email,
        role: "student",
        department,
        level,
        createdAt: Date.now(),
      });


    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <div className="login-page">
        <main className="login-main">
          <div className="login-container">
            <h1 className="login-title">Studet Information</h1>
            <form className="login-form" action="#" method="post">
              <label className="login-label">Name</label>
              <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="login-input" />

              <label htmlFor="CollegeEmail" className="login-label">Email</label>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)}  className="login-input" />

              <label htmlFor="password" className="login-label">Password</label>
              <input type="password"  placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" />

              <label htmlFor="Department" className="login-label">Department</label>
              <input placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} className="login-input" />

              <label htmlFor="Level" className="login-label">Level</label>
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

              <button className="login-button" onClick={handleRegister}>Create account</button>
            </form>
            <p className="login-footer">Do you have an account? <Link to="/login" className="login-link">Login</Link></p>
          </div>
        </main>
      </div>

    </>
  );
}