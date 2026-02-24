
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { StudentProfile } from './Pages/StudentProfile';

function App() {
  return (
    <Routes>
      <Route path='/' element={<StudentProfile/> } />
      <Route path='*' element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;
