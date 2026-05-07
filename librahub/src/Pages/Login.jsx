import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  FacebookAuthProvider,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Invalid email format.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/popup-closed-by-user":
        return "Login was cancelled.";
      case "auth/account-exists-with-different-credential":
        return "This email is already registered with another login method.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

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

    return { data: userSnap.data() };
  };

  const handleFacebookLogin = async () => {
    setErrorMessage("");

    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { data } = await saveUserIfNew(result.user);

      if (!data.department || !data.level) {
        navigate("/complete-profile");
      } else {
        navigate("/home");
      }
    } catch (e) {
      setErrorMessage(getFriendlyErrorMessage(e.code));
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");

    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const { data } = await saveUserIfNew(res.user);

      if (!data.department || !data.level) {
        navigate("/complete-profile");
      } else {
        navigate("/home");
      }
    } catch (e) {
      setErrorMessage(getFriendlyErrorMessage(e.code));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const user = userCredential.user;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        if (userData.role === "admin") {
          navigate("/Borrow");
        } else {
          navigate("/home");
        }
      } else {
        setErrorMessage("No user data found.");
      }
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error.code));
    }
  };

  const handleResetPassword = async () => {
    setResetMessage("");

    if (!resetEmail.trim()) {
      setResetMessage("Please enter your email.");
      return;
    }

    try {
      setResetLoading(true);
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("✅ Password reset email sent successfully.");
    } catch (error) {
      setResetMessage(getFriendlyErrorMessage(error.code));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-container">
          <img src="/book.jpg" alt="Graduation Cap" className="login-icon" />

          <h1 className="login-title">Login</h1>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="CollegeEmail" className="login-label">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage("");
              }}
              placeholder="Enter your email"
              required
              className="login-input"
            />

            <label htmlFor="password" className="login-label">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage("");
              }}
              placeholder="Enter your password"
              required
              className="login-input"
            />

            <div className="forgot-password-container">
              <button
                type="button"
                className="forgot-password-btn"
                onClick={() => {
                  setResetEmail(email);
                  setResetMessage("");
                  setShowResetModal(true);
                }}
              >
                Forgot Password?
              </button>
            </div>

            {errorMessage && (
              <p className="login-error-message">{errorMessage}</p>
            )}

            <button type="submit" className="login-button">
              Login
            </button>

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

      {showResetModal && (
        <div
          className="login-reset-overlay"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="login-reset-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="login-reset-close"
              onClick={() => setShowResetModal(false)}
            >
              ✕
            </button>

            <h3 className="login-reset-title">Reset Password</h3>

            <p className="login-reset-text">
              Enter your email to receive a password reset link.
            </p>

            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => {
                setResetEmail(e.target.value);
                setResetMessage("");
              }}
              className="login-reset-input"
            />

            {resetMessage && (
              <p className="login-reset-message">{resetMessage}</p>
            )}

            <button
              className="login-reset-btn"
              onClick={handleResetPassword}
              disabled={resetLoading}
            >
              {resetLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
