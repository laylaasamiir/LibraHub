import React from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Layout.css";

const Header = () => {
  return (<>
    <header className="top-header">
      <div className="logo">LibraHub 📚</div>

      <Link to="/StudentProfile" className="profile-icon-link">
        <FaUserCircle size={30} />
      </Link>
    </header>
    
  </>
  );
};

export default Header;