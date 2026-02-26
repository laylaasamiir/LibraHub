import './App.css';
import { Route, Routes } from 'react-router-dom';
import { StudentProfile } from './Pages/StudentProfile';
import Login from './Pages/Login';


import Main from './Pages/Main';
import Register from './Pages/Register';

function App() {
  return (
    <Routes>
      <Route path='/' element={<StudentProfile/> } />
      <Route path='login' element={<Login/>}/>
      <Route path='/Register' element={<Register/>}/>
      <Route path='/Main' element={<Main/>}/>
      <Route path='*' element={<h1>404 Not Found</h1>} />
      
    </Routes>
  );
}

export default App;