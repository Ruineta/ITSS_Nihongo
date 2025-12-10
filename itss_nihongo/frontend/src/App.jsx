import { Routes, Route } from 'react-router-dom';
import './App.css';
import ExpShare from './pages/ExperienceShare';
import UploadSlide from './pages/UploadSlide';
import SlideRanking from "./pages/SlideRanking";
import SlideSearch from './pages/SlideSearch';
import SlideDiscussion from './pages/SlideDiscussion';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<SlideSearch/>}/>
        <Route path='/exp-share' element={<ExpShare/>}/>
        <Route path='/upload' element={<UploadSlide/>}/>
        <Route path='/search' element={<SlideSearch/>}/>
        <Route path='/discussion/:slideId' element={<SlideDiscussion/>}/>
        <Route path='/ranking' element={<SlideRanking/>}/>
        <Route path='/profile' element={<ExpShare/>}/>
      </Routes>
    </div>
  );
}

export default App;