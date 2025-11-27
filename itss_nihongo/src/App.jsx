import { Routes, Route } from 'react-router-dom';
import './App.css';
import ExperienceShare from './pages/ExperienceShare';
import UploadSlide from './pages/UploadSlide';

function App() {
  return (
    <Routes>
      <Route path='/' element={<ExperienceShare/>}/>
      <Route path='/exp-share' element={<ExperienceShare/>}/>
      <Route path='/upload-slide' element={<UploadSlide/>}/>
    </Routes>
  );
}

export default App;