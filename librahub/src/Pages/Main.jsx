import React from 'react'
import "./main.css";
import {FaUser, FaLock} from "react-icons/fa";
const Main = () => {
    
  return (
     <>
     <div className="borrow-page">
        <div className="borrow-card">
        <h2>Borrow Book</h2>
         
        <div className="card"> 
         <label> Enter Student: </label>

         <div className="input-box">
              <FaUser className="icon"/>
         <input type="text" placeholder="Enter Your Name or ID..."/>
         </div>
          
         </div>
         <label>Enter Book Copy ID:</label>
        <div className='input-box'>
        <FaLock className="icon"/>
          
            <input type="text" placeholder="Enter Book Copy ID... "/>
        </div>
         
         
        <br/>
        <div className="buttons">
        <button className="confirm">Confirm Borrow</button>
        <button className="return">Return</button>
        </div>
        
       <div className="table-container">
        <table className="borrow-table">
            <caption>Students Record</caption>
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Book Title</th>
                    <th>Borrow At</th>
                </tr>
            </thead>
            <tbody>
                  <tr>
                    <td> menna</td>
                    <td>mathimatical</td>
                    <td>25-2-2026 10pm</td>
                    <td style={{textAlign:'center'}}>
                         
                    </td>


                </tr>
            </tbody>
        </table>
       </div>

        </div>

         
         </div>
     
     </>
      )
}

export default Main
