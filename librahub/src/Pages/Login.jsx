import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; 
import { Link } from "react-router-dom";
import './login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault(); 

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      if (userData.role === "admin") navigate("/Admin");
      else navigate("/StudentProfile");
    } else {
      alert("No user data found.");
    }

  } catch (error) {
    alert(error.message);
  }
};
  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-container">
          <img src="/book.jpg" alt="Graduation Cap" className="login-icon"/>
          <h1 className="login-title">Login</h1>
          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="CollegeEmail" className="login-label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="login-input"/>

            <label htmlFor="password" className="login-label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required className="login-input"/>

            <button type="submit" className="login-button">Login</button>
          </form>
          <p className="login-footer">Don't have an account? <Link to="/Register" className="login-link">Register</Link></p>
        </div>
      </main>
    </div>
  );
}

export default Login;
