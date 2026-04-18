import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { StudentProfile } from './Pages/StudentProfile';
import Borrow from './Pages/Borrow';
import Login from './Pages/Login';
import Register from './Pages/Register';
import { Main } from './Pages/Main';
import { AdminSidebar } from './Pages/AdminSidebar';
import AddBook from './Pages/AddBook';
import { Complete } from './components/Complete';
import AdminRegister from './Pages/AdminRegister';
import Favorites from './Pages/Favorites';
import StudentHome from './Pages/StudentHome';
import Layout from './components/Layout';
import BooksTable from './Pages/bookstable';
import { AddAndRemove } from './Pages/AddAndRemove';
import Header from './components/Header';
import ConfirmTable from './Pages/confirmtable';
import BookDetails from './Pages/BookDetails';
import AdminRequests from './components/AdminRequest';
import AiAddBook from './Pages/AiAddBook';
import AdminAddBook from './Pages/AdminAddBook';

function AppContent() {
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const hideNavbarPaths = ['/', '/login', '/register', '/complete-profile'];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <>
      {showNavbar && <Header />}
   

<Routes>
  <Route path='/' element={<Main />} />
  <Route path='/login' element={<Login />} />
  <Route path='/register' element={<Register />} />
  <Route path='/complete-profile' element={<Complete />} />


  
  <Route element={<Layout />}>
    <Route path="/home" element={<StudentHome />} />
    <Route path="/book-details" element={<BookDetails />} />
    <Route path="/favorites" element={<Favorites />} />
    {role !== 'admin' && <Route path='/StudentProfile' element={<StudentProfile />} />}
  </Route>


  <Route element={<AdminSidebar />}>
    <Route path='/Borrow' element={<Borrow />} />
    <Route path='/AddBook' element={<AddBook />} />
    <Route path='/add-and-remove' element={<AddAndRemove />} />
    <Route path='/books' element={<BooksTable />} />
    <Route path='/AdminRegister' element={<AdminRegister />} />
    <Route path="/confirm-table" element={<ConfirmTable />} />
    <Route path='/AdminRqu' element={<AdminRequests />} />
    <Route path='/AiAddBook' element={<AiAddBook />} />
    <Route path='/AdminAddBook' element={<AdminAddBook />} />
    {role === 'admin' && <Route path='/StudentProfile' element={<StudentProfile />} />}
  </Route>

  <Route path='*' element={<h1>404 Not Found</h1>} />
</Routes>
    </>
  );
}

export default AppContent;