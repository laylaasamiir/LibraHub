import React from 'react'
import '../Pages/StudentProfile.css'
export const StuCard = () => {
    return (
        <>
            <div className="pc-card">
                <h2 className="pc-title">Profile</h2>

                <div className="pc-table">
                    <div className="pc-row ">
                        <div className="pc-label">Email:</div>

                    </div>

                    <div className="pc-row">
                        <div className="pc-label">Department:</div>

                    </div>

                    <div className="pc-row">
                        <div className="pc-label">Level:</div>

                    </div>
                </div>

                <div className="pc-actions">
                    <button className="pc-btn" >
                        Fine Details
                    </button>
                </div>
            </div>
            </>
    )
}
