
import { FaSignOutAlt } from "react-icons/fa";
import "./admin.css";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Link, Outlet,useNavigate } from 'react-router-dom';

export const AdminSidebar = () => {
   const navigate = useNavigate();

   const handleLogout = async () => {
          try {
            await signOut(auth);
            navigate("/");
          } catch (error) {
            console.log(error);
          }
        };
  return (
    <div className='Admin'>
      <div className='sidebarAdmin'>
        <h1>Admin Panel</h1>
        <Link to={"/Borrow"}>Borrow & Return</Link>
        <Link to={"/add-and-remove"}>Admins</Link>
        <Link to={"/AdminAddBook"}>Add New Books</Link>
        <Link to={"/AdminRegister"}>Add New Admin</Link>
         <Link to={"/books"}>Book Management</Link>
         <Link to="/confirm-table">History</Link>
         <div className="nav-item-logout" onClick={handleLogout}>
                          <FaSignOutAlt size={24} />
                          <span>Exit</span>
                      </div>
      </div>
      <div className='content'>
        <Outlet />
      </div>
    </div>
  )
}
