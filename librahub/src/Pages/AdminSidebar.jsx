
import "./admin.css";
import { Link, Outlet } from 'react-router-dom';

export const AdminSidebar = () => {
  return (
    <div className='Admin'>
      <div className='sidebar'>
        <h1>Admin Panel</h1>
        <Link to={"/Borrow"}>Borrow & Return</Link>
        <Link to={"/add-and-remove"}>Admins</Link>
        <Link to={"/AddBook"}>Add New Books</Link>
        <Link to={"/AdminRegister"}>Add New Admin</Link>
         <Link to={"/books"}>Book Management</Link>
         <Link to="/confirm-table">Confirm Table</Link>
      </div>
      <div className='content'>
        <Outlet />
      </div>
    </div>
  )
}
