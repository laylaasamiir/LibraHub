import React from 'react'
import "./Main.css";
import { Link } from 'react-router-dom';

export const Main = () => {
  return (
   <>
   <div className="container">
        <h1>Welcome to LibraHub!</h1>
        <h2>Are you?</h2>

        <div className="boxs">

        
            <div className="light">
                <img src='/Student.jpeg'  alt="Student"/>
                <h3>Student</h3>
                <Link to={"/login"}>
                <button>Access Role</button>
                </Link>
            </div>

    
            <div className="dark">
                <img src="Admin.jpeg" alt="Librarian"/>
                <h3>Librarian / Admin</h3>
                <Link to={"/login"}>
                <button>Select Role</button>
                </Link>
            </div>

        </div>
    </div>
   </>
  )
}
