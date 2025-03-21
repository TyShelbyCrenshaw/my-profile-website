//import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Navbar from './Navbar';
import Home from './Home';
import LandingPage from './LandingPage';
import Skills from './Skills';
import Projects from './Projects';
import WorkProjects from './WorkProjects';
import SchoolProjects from './SchoolProjects';
import Testimonials from './Testimonials';
import Contact from './Contact';
import AnimatedBackground from './components/AnimatedBackground.js';
import MusicPage from './MusicPage'; 
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import './index.css';
import picture from './pictures/porfolio_photos/imgonline-com-ua-TextureSeamless-JCI8TaR1FBycHm.jpg';

const LandingPageContainer = () => (
  <div className="LandingPage-container" style={{backgroundImage: `url(${picture})`}}>
    <AnimatedBackground />
    <LandingPage />
  </div>
);

const DefaultContainer = () => (
  <div style={{backgroundImage: `url(${picture})`}}>
    <Navbar />
      <Routes>
        <Route exact path="/Home" element={<Home />} />
        <Route exact path="/Skills" element={<Skills />} />
        <Route exact path="/Projects" element={<Projects />} />
        <Route exact path="/Testimonials" element={<Testimonials />} />
        <Route exact path="/Contact" element={<Contact />} />
        <Route exact path="/WorkProjects" element={<WorkProjects />} />
        <Route exact path="/SchoolProjects" element={<SchoolProjects />} />
        <Route exact path="/Music" element={<MusicPage />} />
      </Routes>
  </div>
);


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/LandingPage" element={<LandingPageContainer />} />
        <Route exact path="/" element={<LandingPageContainer />} />
        <Route path="*" element={<DefaultContainer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
