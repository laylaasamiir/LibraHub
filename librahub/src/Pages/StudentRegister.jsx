import React from 'react'
import './StudentRegister.css'
const StudentRegister = () => {
  return (
    <>
    <main>
     <div className="register-container">
                <h1>Create new account</h1>
                <form action="#" method="post">
                    <label htmlfor="CollegeEmail">email</label>
                    <input type="email" id="CollegeEmail" name="CollegeEmail" placeholder="Enter your email" required/>

                    <label htmlfor="password">password</label>
                    <input type="password" id="password" name="password" placeholder="Enter your password" required/>

                    <label htmlfor="studentId">Student Id</label>
                    <input type="number" id="studentId" name="studentId" placeholder="Enter your Id" required/>

                    <button type="submit">sign up</button>
                </form>
            </div> 
    </main>
    </>

  )

}

export default StudentRegister
