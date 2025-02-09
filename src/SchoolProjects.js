import React from 'react';
import picture from './pictures/porfolio_photos/background2.jpg';
import mainBOS from './pictures/porfolio_photos/BOSContactSheet.jpg';

const SchoolProjects = () => {
  // Creating an array of image URLs
  const images = require.context('./pictures/class_photos', false, /\.(jpg|JPG|jpeg)$/);
  const imageList = images.keys().map((image) => images(image));

  return (
    <div className="container mt-5" style={{ width: "100vw", minHeight: "100vh", overflow: "auto" }}>
      {/* Education Section */}
      <div className="p-3 bg-tertiary shadow"> 
        <div className="bg-secondary m-3 p-5 shadow">
          {/* Education Overview */}
          <div className="mb-5">
            <h2 className="text-accent mb-4">Educational Journey</h2>
            <div className="bg-tertiary p-4 rounded shadow-sm">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary rounded-circle p-3 me-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tertiary">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <div>
                  <h4 className="mb-2">Computer Science</h4>
                  <p className="mb-0 text-accent">Bachelor of Science - Completed</p>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <div className="bg-primary rounded-circle p-3 me-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tertiary">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                    <path d="M2 2l7.586 7.586"/>
                    <circle cx="11" cy="11" r="2"/>
                  </svg>
                </div>
                <div>
                  <h4 className="mb-2">Art and Design</h4>
                  <p className="mb-0 text-accent">Bachelor of Science - In Progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Photography Section */}
          <div className="mt-5">
            <h3 className="text-accent mb-4">Photography Portfolio</h3>
            <div className="moodboard p-4" style={{ 
              backgroundImage: `url(${picture})`,
              borderRadius: "1rem",
              boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)"
            }}>
              {/* Contact Sheet */}
              <div className="row mb-4">
                <div className="col-12">
                  <img 
                    className="img-fluid rounded shadow photo" 
                    src={mainBOS} 
                    alt="Contact Sheet"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Photo Grid - Maintaining your existing grid structure */}
              <div className="row">
                {/* First Column */}
                <div className="col-md-4 d-flex flex-column">
                  {imageList.slice(0, Math.ceil(imageList.length / 3)).map((image, index) => (
                    <div key={index} className="mb-4">
                      <img 
                        className="img-fluid rounded shadow photo" 
                        src={image} 
                        alt={`Class photo ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Second Column */}
                <div className="col-md-4 d-flex flex-column">
                  {imageList.slice(Math.ceil(imageList.length / 3), Math.ceil(2 * imageList.length / 3)).map((image, index) => (
                    <div key={index} className="mb-4">
                      <img 
                        className="img-fluid rounded shadow photo" 
                        src={image} 
                        alt={`Class photo ${Math.ceil(imageList.length / 3) + index + 1}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Third Column */}
                <div className="col-md-4 d-flex flex-column">
                  {imageList.slice(Math.ceil(2 * imageList.length / 3)).map((image, index) => (
                    <div key={index} className="mb-4">
                      <img 
                        className="img-fluid rounded shadow photo" 
                        src={image} 
                        alt={`Class photo ${Math.ceil(2 * imageList.length / 3) + index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolProjects;