import './App.css';
import { Route, Routes } from 'react-router-dom';
import { StudentProfile } from './Pages/StudentProfile';
 
import Borrow from './Pages/Borrow';
 
import Login from './Pages/Login';
import Register from './Pages/Register';

 

function App() {
  return (
    <Routes>
      <Route path='/' element={<StudentProfile/> } />
 
      <Route path='/Borrow' element={<Borrow/>}/>
 
      <Route path='login' element={<Login/>}/>
      <Route path='Register' element={<Register/>}/>
  
 
      <Route path='*' element={<h1>404 Not Found</h1>} />
      
    </Routes>
  );
}

export default App;