import React from 'react'
import { StuCard } from '../components/Stucard'
import { StuTable } from '../components/StuTable'
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./StudentProfile.css";



export const StudentProfile = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <StuCard />
      <StuTable />
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </>
  )
}
