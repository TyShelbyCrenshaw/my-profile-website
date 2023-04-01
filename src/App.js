import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Navbar from './Navbar';
import Home from './Home';
import LandingPage from './LandingPage';
import Skills from './Skills';
import Projects from './Projects';
import Testimonials from './Testimonials';
import Contact from './Contact';

// const LandingPageContainer = () => (
//   <div className="LandingPage-container">
//     <Route exact path="/" render={() => <Navigate to="/LandingPage" />} />
//     <Route path="/LandingPage" component={LandingPage} />
//   </div>
// );
const LandingPageContainer = () => (
  <div className="LandingPage-container">
    <LandingPage />
  </div>
);

const DefaultContainer = () => (
  <div>
    <Navbar />
      <Routes>
        <Route path="/Home" element={<Home />} />
        <Route path="/Skills" element={<Skills />} />
        <Route path="/Projects" element={<Projects />} />
        <Route path="/Testimonials" element={<Testimonials />} />
        <Route path="/Contact" element={<Contact />} />
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
