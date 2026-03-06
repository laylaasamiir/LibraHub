import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import '../Pages/login.css'
import { Link, useNavigate } from "react-router-dom";

export default function AdminRegister() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorName, setErrorName] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    setErrorEmail("");
    setErrorPassword("");
    setErrorName("");

    let valid = true;

    if (!name) {
      setErrorName("Name is required");
      valid = false;
    }

    if (!email) {
      setErrorEmail("Email is required");
      valid = false;
    }

    if (password.length < 6) {
      setErrorPassword("Password must be at least 6 characters");
      valid = false;
    }

    if (!valid) return;

    try {

      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        name,
        email,
        role: "admin",
        createdAt: Date.now(),
      });

      navigate("/Admin");

    } catch (e) {

      switch (e.code) {

        case "auth/email-already-in-use":
          setErrorEmail("Email already registered");
          break;

        case "auth/invalid-email":
          setErrorEmail("Invalid email format");
          break;

        case "auth/weak-password":
          setErrorPassword("Password is too weak (min 6 characters)");
          break;

        default:
          setErrorEmail("Something went wrong. Please try again.");

      }

    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-container">

          <h1 className="login-title">Admin Register</h1>

          <form className="login-form">

            {errorName && <div className="input-error">{errorName}</div>}
            <label className="login-label">Admin Name</label>
            <input
              required
              placeholder="Admin Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="login-input"
            />

            {errorEmail && <div className="input-error">{errorEmail}</div>}
            <label className="login-label">Email</label>
            <input
              required
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />

            {errorPassword && <div className="input-error">{errorPassword}</div>}
            <label className="login-label">Password</label>
            <input
              required
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />

            <button className="login-button" onClick={handleRegister}>
              Create Admin
            </button>

          </form>

          <p className="login-footer">
            Back to <Link to="/Admin" className="login-link">Dashboard</Link>
          </p>

        </div>
      </main>
    </div>
  );
}