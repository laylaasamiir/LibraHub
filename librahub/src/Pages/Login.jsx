import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import './login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault(); 

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful ✅");
    navigate("/StudentProfile"); 
  } catch (error) {
    alert(error.message);
  }
};
  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-container">
          <img src="/gradCap.jpg" alt="Graduation Cap" className="login-icon"/>
          <h1 className="login-title">Student Login</h1>
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
