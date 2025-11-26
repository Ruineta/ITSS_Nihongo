import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ExperienceShare from './pages/ExperienceShare';
import UploadSlide from './pages/UploadSlide';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<ExperienceShare/>}/>
        <Route path='/exp-share' element={<ExperienceShare/>}/>
        <Route path='/upload' element={<UploadSlide/>}/>
        <Route path='/search' element={<ExperienceShare/>}/>
        <Route path='/discussion' element={<ExperienceShare/>}/>
        <Route path='/ranking' element={<ExperienceShare/>}/>
        <Route path='/profile' element={<ExperienceShare/>}/>
      </Routes>
    </Router>
  );
}

export default App;