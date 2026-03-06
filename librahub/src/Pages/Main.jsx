import React from 'react'
import "./Main.css";
import { Link } from 'react-router-dom';

export const Main = () => {
  return (
   <>
   <div className="container">
        <h1>Welcome to LibraHub!</h1>
       

        <div className="boxs">

        
            <div className="light">
                <img src='/Student.jpeg'  alt="Student"/>
                <Link to={"/login"}>
                <button>Get started</button>
                </Link>
            </div>

    
       

        </div>
    </div>
   </>
  )
}
