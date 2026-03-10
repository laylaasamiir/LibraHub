import React from 'react';
import "./admin.css";
import { Link, Outlet } from 'react-router-dom';

export const Admin = () => {
  return (
    <div className='Admin'>
      <div className='sidebar'>
        <h1>Admin Panel</h1>
        <Link to="borrow">Borrow</Link>
        <Link to="add-and-remove">Add and Remove Admins</Link>
        <Link to="add-book">Add Books</Link>
        <Link to="admin-register">Add New Admin</Link>
      </div>
      <div className='content'>
        <Outlet />
      </div>
    </div>
  )
}
