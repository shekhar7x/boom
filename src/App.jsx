import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Common/Header';
import Recorder from './components/Recorder/Recorder';
import Dashboard from './components/Dashboard/Dashboard';
import VideoPlayer from './components/VideoPlayer/VideoPlayer';
import VideoEditor from './components/Editor/VideoEditor';
import './styles/global.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Recorder />} />
            <Route path="/videos" element={<Dashboard />} />
            <Route path="/video/:id" element={<VideoPlayer />} />
            <Route path="/edit/:id" element={<VideoEditor />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
