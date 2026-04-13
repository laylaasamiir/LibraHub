import { Link, Outlet, useNavigate } from "react-router-dom";
import "./Layout.css";
import { FaUserCircle, FaHeart, FaHome, FaSignOutAlt } from "react-icons/fa";
import ReviewsSidebar from "../Pages/Reviews";


const Layout = () => {
    const navigate = useNavigate();

    return (
        <>


            <Outlet />
            <nav className="bottom-nav">
                <Link to="/home" state={{ resetCategory: true }} className="nav-item">
                    <FaHome size={24} />
                    <span>Home</span>
                </Link>
                <Link to="/favorites" className="nav-item">
                    <FaHeart size={24} />
                    <span>Favs</span>
                </Link>
                <div className="nav-item" onClick={() => navigate('/')}>
                    <FaSignOutAlt size={24} />
                    <span>Exit</span>
                </div>
            </nav>
            <ReviewsSidebar />
        </>
    );
};

export default Layout;