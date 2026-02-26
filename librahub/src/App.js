
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { StudentProfile } from './Pages/StudentProfile';
import Login from './Pages/Login';
import StudentRegister from './Pages/studentRegister';

function App() {
  return (
    <Routes>
      <Route path='/' element={<StudentProfile/> } />
      <Route path='login' element={<Login/>}/>
      <Route path='StudentRegister' element={<StudentRegister />} />
      <Route path='*' element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;
