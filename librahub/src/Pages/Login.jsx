import React from 'react';
import './login.css';

const Login = () => {
  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-container">
          <img src="/gradCap.jpg" alt="Graduation Cap" className="login-icon"/>
          <h1 className="login-title">Student Login</h1>
          <form className="login-form" action="#" method="post">
            <label htmlFor="CollegeEmail" className="login-label">Email</label>
            <input type="email" id="CollegeEmail" name="CollegeEmail" placeholder="Enter your email" required className="login-input"/>

            <label htmlFor="password" className="login-label">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required className="login-input"/>

            <button type="submit" className="login-button">Login</button>
          </form>
          <p className="login-footer">Don't have an account? <a href="#" className="login-link">Register</a></p>
        </div>
      </main>
    </div>
  );
}

export default Login;
