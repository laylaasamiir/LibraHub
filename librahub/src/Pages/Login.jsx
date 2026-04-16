import React, { useState } from 'react';
import { signInWithEmailAndPassword, FacebookAuthProvider, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import './login.css';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const saveUserIfNew = async (user) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        role: "student",
        department: "",
        level: "",
        createdAt: Date.now(),
      });

      return {
        isNew: true,
        data: {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          role: "student",
          department: "",
          level: "",
        },
      };
    }

    return {
      isNew: false,
      data: userSnap.data(),
    };
  };

  const handleFacebookLogin = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { data } = await saveUserIfNew(result.user);

      if (!data.department || !data.level) {
        navigate("/complete-profile", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }

    } catch (e) {
      console.log(e.code, e.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const { data } = await saveUserIfNew(res.user);

      if (!data.department || !data.level) {
        navigate("/complete-profile", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }

    } catch (e) {
      console.log(e.code, e.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // 🔥 بعد أي login ناجح → Home
      navigate("/home", { replace: true });

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-container">
          <img src="/book.jpg" alt="Graduation Cap" className="login-icon" />
          <h1 className="login-title">Login</h1>

          <form className="login-form" onSubmit={handleLogin}>
            <label className="login-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="login-input"
            />

            <label className="login-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="login-input"
            />

            <button type="submit" className="login-button">Login</button>

            <div className="social-login">
              <button
                type="button"
                className="social-btn facebook"
                onClick={handleFacebookLogin}
              >
                <FaFacebook />
              </button>

              <button
                type="button"
                className="social-btn google"
                onClick={handleGoogleLogin}
              >
                <FcGoogle />
              </button>
            </div>
          </form>

          <p className="login-footer">
            Don't have an account?{" "}
            <Link to="/Register" className="login-link">
              Register
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
