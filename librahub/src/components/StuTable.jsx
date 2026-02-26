import React from 'react'
import '../Pages/StudentProfile.css'
export const StuTable = () => {
    return (
        <>
            <div className="pc-card">
                <table className="loans-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Book Title</th>
                            <th>Borrow Date</th>
                            <th>Return Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                </table>
            </div>


        </>
    )
}
