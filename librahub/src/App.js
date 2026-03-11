import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { StudentProfile } from './Pages/StudentProfile';
import Borrow from './Pages/Borrow';
import Login from './Pages/Login';
import Register from './Pages/Register';
import { Main } from './Pages/Main';
import {  AdminSidebar } from './Pages/AdminSidebar';
import AddBook from './Pages/AddBook';
import { Complete } from './components/Complete';
import AdminRegister from './Pages/AdminRegister';
import Favorites from './Pages/Favorites';
import StudentHome from './Pages/StudentHome';
import Layout from './components/Layout';
import BooksTable from './Pages/bookstable';
import { AddAndRemove } from './Pages/AddAndRemove';
import Header from './components/Header';


function AppContent() {
  const location = useLocation();
  const hideNavbarPaths = ['/', '/login', '/register', '/complete-profile'];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);
  return (
    <>
      {showNavbar && <Header/>}
      <Routes>
      

        <Route path='/' element={<Main />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/complete-profile' element={<Complete />} />


       <Route element={<Layout />}>
        <Route path="/home" element={<StudentHome />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path='/StudentProfile' element={<StudentProfile />} />

       </Route>

        
        <Route element={<AdminSidebar />}>
        <Route path='/Borrow' element={<Borrow />} />
        <Route path='/AddBook' element={<AddBook />} />
        <Route path='/add-and-remove' element={<AddAndRemove />} />
        <Route path='/books' element={<BooksTable />} />
        <Route path='/AdminRegister' element={<AdminRegister />} />
        </Route>
       

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