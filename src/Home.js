import React from 'react';
//import backgroundImage from './pictures/porfolio_photos/imgonline-com-ua-TextureSeamless-JCI8TaR1FBycHm.jpg';
import picture from './pictures/porfolio_photos/FaceShot2.png';

const Home = () => {
  return (
    <div className="container mt-5" style={{width: "100vw", minHeight: "100vh"}}>
      <div className="p-4 bg-tertiary shadow"> 
        <div className="bg-secondary m-3 p-5 shadow rounded">
          <div className="container"> 
            <div className="row align-items-center">
              {/* Image Column */}
              <div className="col-md-5 mb-4 mb-md-0">
                <div className="position-relative">
                  <div className="rounded-3 overflow-hidden shadow-lg">
                    <img 
                      src={picture} 
                      alt="Ty Crenshaw"
                      className="img-fluid"
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                  {/* Decorative element */}
                  <div 
                    className="position-absolute bg-primary" 
                    style={{
                      width: "100%",
                      height: "100%",
                      top: "10px",
                      left: "10px",
                      zIndex: -1,
                      opacity: 0.3,
                      borderRadius: "0.5rem"
                    }}
                  ></div>
                </div>
              </div>

              {/* Content Column */}
              <div className="col-md-7">
                <div className="ps-md-4">
                  <h1 className="display-4 text-accent mb-4">Ty Crenshaw</h1>
                  <h3 className="text-primary mb-4">Software Developer at LinkTrust</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-accent mb-3">Professional Background</h4>
                    <p className="mb-4 text-secondary">
                      As a software developer at LinkTrust, I specialize in building online marketing solutions using .NET Framework, React, and MSSQL database. With over five years of experience, I've developed robust solutions that help businesses optimize their marketing strategies.
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-accent mb-3">Technical Expertise</h4>
                    <p className="mb-4 text-secondary">
                      My work primarily focuses on full-stack development, combining .NET Framework backend with React frontend. I'm particularly interested in artificial intelligence and constantly exploring new technologies to enhance our solutions.
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-accent mb-3">Personal Interests</h4>
                    <p className="mb-4 text-secondary">
                      Outside of coding, I enjoy gaming with my wife (Overwatch, Marvel Rivals, Beyond All Reason), taking walks, and occasionally pursuing outdoor activities like hiking and climbing. I'm always seeking new opportunities to grow both professionally and personally.
                    </p>
                  </div>

                  {/* Skills Tags */}
                  <div className="mt-4">
                    <div className="d-flex flex-wrap gap-2">
                      {['.NET', 'React', 'MSSQL', 'Full Stack', 'AI'].map((skill) => (
                        <span 
                          key={skill}
                          className="bg-primary text-tertiary px-3 py-1 rounded-pill"
                          style={{ fontSize: "0.9rem" }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;