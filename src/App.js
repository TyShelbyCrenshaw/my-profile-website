import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Navbar from './Navbar';
import Home from './Home';
import LandingPage from './LandingPage';
import Skills from './Skills';
import Projects from './Projects';
import Testimonials from './Testimonials';
import Contact from './Contact';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import picture from './pictures/DishonoredGods_Link_from_Zelda_fighting_blood_war_8k_realistic._b8790919-6827-4498-8a24-f5e8131d0c13.png';

const LandingPageContainer = () => (
  <div className="LandingPage-container" style={{backgroundImage: `url(${picture})`}}>
    <LandingPage />
  </div>
);

const DefaultContainer = () => (
  <div>
    <Navbar />
      <Routes>
        <Route exact path="/Home" element={<Home />} />
        <Route exact path="/Skills" element={<Skills />} />
        <Route exact path="/Projects" element={<Projects />} />
        <Route exact path="/Testimonials" element={<Testimonials />} />
        <Route exact path="/Contact" element={<Contact />} />
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
