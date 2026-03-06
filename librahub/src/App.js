import './App.css';
import { Route, Routes } from 'react-router-dom';
import { StudentProfile } from './Pages/StudentProfile';
import Borrow from './Pages/Borrow';
import Login from './Pages/Login';
import Register from './Pages/Register';
import { Main } from './Pages/Main';
import { Admin } from './Pages/Admin';
import AddBook from './Pages/AddBook';
import { Complete } from './components/Complete';
import AdminRegister  from './Pages/AdminRegister';
 

function App() {
  return (
    <Routes>
      <Route path='/StudentProfile' element={<StudentProfile/> } />
      <Route path='/Borrow' element={<Borrow/>}/>
      <Route path='login' element={<Login/>}/>
      <Route path='Register' element={<Register/>}/>
      <Route path='/Main' element={<Main/>}/>
      <Route path='/Admin' element={<Admin/>} />
      <Route path='/add-book' element={<AddBook/>} />
      <Route path='/complete-profile' element={<Complete />} />
      <Route path='/AdminRegister' element={<AdminRegister/>} />
 
      <Route path='*' element={<h1>404 Not Found</h1>} />
      
    </Routes>
  );
}

export default App;