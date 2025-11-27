import { Routes, Route } from 'react-router-dom';
import './App.css';
import ExpShare from './pages/ExperienceShare';
import UploadSlide from './pages/UploadSlide';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<ExpShare/>}/>
        <Route path='/exp-share' element={<ExpShare/>}/>
        <Route path='/upload' element={<UploadSlide/>}/>
        <Route path='/search' element={<ExpShare/>}/>
        <Route path='/discussion' element={<ExpShare/>}/>
        <Route path='/ranking' element={<ExpShare/>}/>
        <Route path='/profile' element={<ExpShare/>}/>
      </Routes>
    </div>
  );
}

export default App;