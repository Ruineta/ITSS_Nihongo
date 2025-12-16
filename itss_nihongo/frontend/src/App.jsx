import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Auth from './pages/Auth';
import ExpShare from './pages/ExperienceShare';
import UploadSlide from './pages/UploadSlide';
import SlideRanking from "./pages/SlideRanking";
import SlideSearch from './pages/SlideSearch';
import SlideDiscussion from './pages/SlideDiscussion';


function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path='/' element={<SlideSearch/>}/>
          <Route path='/auth' element={<Auth/>}/>
          <Route path='/exp-share' element={<ExpShare/>}/>
          <Route path='/upload' element={<UploadSlide/>}/>
          <Route path='/search' element={<SlideSearch/>}/>
          <Route path='/discussion/1' element={<SlideDiscussion/>}/>
          <Route path='/ranking' element={<SlideRanking/>}/>
          <Route path='/profile' element={<ExpShare/>}/>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;