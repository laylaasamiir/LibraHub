import React from 'react'
import "./Main.css";
import { Link } from 'react-router-dom';

export const Main = () => {
 return (
    <div className="page">
      
      <section className="hero">
        <div className="hero-icon">📖</div>
        <h1 className="hero-title">
          Welcome to <span>LibraHub</span>
        </h1>
        <p className="hero-subtitle">
          Borrow books, track your reading, and manage everything in one place.
        </p>
        <div className="hero-buttons">
            <Link to="/home">
          <button className="btn-primary">Get Started</button>
            </Link>
            <Link to="/login">
          <button className="btn-outline">Login</button>
          </Link>
        </div>
      </section>

    
      <section className="features">
        <h2 className="features-title">What you can do</h2>
        <div className="features-grid">
          {[
            { icon: '🔍', title: 'Search Books', desc: 'Find any book in the library quickly and easily.' },
            { icon: '📋', title: 'Track Borrowing', desc: 'See all your borrowed books and due dates.' },
            { icon: '🔔', title: 'Get Alerts', desc: 'Never miss a return date with smart reminders.' },
          ].map((feature, i) => (
            <div key={i} className="feature-card">
              <span className="feature-icon">{feature.icon}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

    

     
      <footer className="footer">
        © 2026 LibraHub. All rights reserved.
      </footer>
    </div>
  )
}
