// src/components/BorrowAdmin.jsx
import React from "react";

function BorrowAdmin() {
  return (
    <div style={{ padding: "20px" }}>
      
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
            <td>React for Beginners</td>
            <td>Menna</td>
            <td>10/03/2026</td>
          </tr>
                 <tr>
                    <td> menna</td>
                    <td>mathimatical</td>
                    <td>25-2-2026 10pm</td>
                    <td style={{textAlign:'center'}}> </td>
                        
                </tr>
        </tbody>
      </table>
    </div>
  );
}

export default BorrowAdmin;