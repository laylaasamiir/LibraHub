import './App.css';
import { BrowserRouter as Router,Route, Routes ,useLocation} from 'react-router-dom';
import { StudentProfile } from './Pages/StudentProfile';
import Borrow from './Pages/Borrow';
import Login from './Pages/Login';
import Register from './Pages/Register';
import { Main } from './Pages/Main';
import { Admin } from './Pages/Admin';
import AddBook from './Pages/AddBook';
import { Complete } from './components/Complete';
import AdminRegister  from './Pages/AdminRegister';
import  {AddAndRemove}  from './Pages/AddAndRemove';
 import Favorites from './Pages/Favorites';
 import StudentHome from './Pages/StudentHome';
import Layout from './components/Layout';

function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/login', '/register', '/AdminRegister', '/complete-profile'];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);
return (
    <>
      {showNavbar && <Layout />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<StudentHome />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/StudentProfile" element={<StudentProfile />} />
      
       <Route path='/StudentProfile' element={<StudentProfile/> } />
      <Route path='/Borrow' element={<Borrow/>}/>
      <Route path='login' element={<Login/>}/>
      <Route path='Register' element={<Register/>}/>
      <Route path='/' element={<Main/>}/>
      <Route path='/Admin' element={<Admin/>} />
      <Route path='/add-book' element={<AddBook/>} />
      <Route path='/complete-profile' element={<Complete />} />
      <Route path='/AdminRegister' element={<AdminRegister/>} />
      <Route path='/AddAndRemove' element={<AddAndRemove />} />
      <Route path='*' element={<h1>404 Not Found</h1>} />
      
    </Routes>


    </>
  );
}

function App() {
  return (
      <AppContent />
  
  );
}

export default App;