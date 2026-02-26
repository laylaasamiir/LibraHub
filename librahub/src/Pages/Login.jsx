import React from 'react'
import './login.css'
const Login = () => {
  return (
    <>
    <main>
     <div className="login-container">
                <img src="/gradCap.jpg" alt="Graduation Cap" className="login-icon"/>
                <h1>Student login</h1>
                <form action="#" method="post">
                    <label htmlfor="CollegeEmail">email</label>
                    <input type="email" id="CollegeEmail" name="CollegeEmail" placeholder="Enter your email" required/>

                    <label htmlfor="password">password</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required/>

                    <button type="submit">login</button>
                </form>
                <p>Don't have an account? <a href="#">Register</a></p>
            </div> 
    </main>
    </>

  )

}

export default Login
