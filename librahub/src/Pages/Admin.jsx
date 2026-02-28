import React from 'react'
import "./admin.css";
import { Link } from 'react-router-dom';

export const Admin = () => {
  return (
   <>
      <div className="container">
        <h1>Welcome to LibraHub!</h1>
        <h2>What do you want?</h2>

        <div className="boxs">

        
            <div className="light">
                <img src="/borrow.jpeg"/>
                <Link to={"/Borrow"}>
                <button>Borrow / Return</button>
                </Link>
            </div>

    
            <div className="dark">
                <img src="./addBook.jpeg"/>
                <button>Add Books</button>
            </div>

        </div>
    </div>
   
   </>
  )
}
