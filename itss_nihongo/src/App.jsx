import './App.css';
import { Routes, Route } from 'react-router-dom';
import ExperienceShare from './pages/ExperienceShare';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<ExperienceShare/>}/>
        <Route path='/exp-share' element={<ExperienceShare/>}/>
      </Routes>
    </div>
  );
}

export default App;
