import React, { useState } from 'react';
import picture from './pictures/porfolio_photos/background2.jpg';

// Import videos
import compilerVideo from './pictures/videos/My Compiler Expilnation.mp4';
import gameVideo from './pictures/videos/My Game Expilnation.mp4';

const SchoolProjects = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  // Creating an array of image URLs
  const images = require.context('./pictures/class_photos', false, /\.(jpg|JPG|jpeg)$/);
  const imageList = [...new Set(images.keys().map((image) => images(image)))];

  const projects = [
    { 
      id: 'compiler', 
      title: 'My Compiler', 
      type: 'video',
      desc: 'Built a custom compiler for educational purposes',
      video: compilerVideo,
      details: 'Detailed explanation of the compiler project, technologies used, challenges faced, and what I learned from building it.'
    },
    { 
      id: 'game', 
      title: 'My Game',
      type: 'video',
      desc: 'Created an interactive pixel game',
      video: gameVideo,
      details: 'Detailed explanation of the game project, game mechanics, design decisions, and development process.'
    },
    {
      id: 'photography',
      title: 'Photography Portfolio',
      type: 'images',
      desc: 'A collection of my photography work',
      images: imageList,
      details: 'Exploring the world through my lens - capturing moments, nature, and creative compositions.'
    }
  ];

  return (
    <div className="container-fluid mt-5" style={{ minHeight: "100vh", overflowX: "hidden" }}>
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

          {/* Master-Detail Project Viewer */}
          <div className="mt-5">
            <h3 className="text-accent mb-4">Project Showcases</h3>
            <div className="row">
              {/* Project List - Left Side */}
              <div className="col-md-4">
                <div className="list-group">
                  {projects.map(project => (
                    <button
                      key={project.id}
                      className={`list-group-item list-group-item-action ${
                        selectedProject?.id === project.id ? 'active' : ''
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      <h5 className="mb-1">{project.title}</h5>
                      <p className="mb-0 small">{project.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Project Detail - Right Side */}
              <div className="col-md-8">
                {selectedProject ? (
                  <div className="card">
                    <div className="card-body">
                      <h3 className="card-title mb-4">{selectedProject.title}</h3>
                      
                      {/* Video Player for video projects */}
                      {selectedProject.type === 'video' && (
                        <div className="mb-4">
                          <video 
                            key={selectedProject.id}
                            controls 
                            className="w-100 rounded"
                            style={{maxHeight: '400px', backgroundColor: '#000'}}
                          >
                            <source src={selectedProject.video} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}

                      {/* Image Gallery for photography */}
                      {selectedProject.type === 'images' && (
                        <div className="mb-4">
                          <div className="moodboard p-4" style={{ 
                            backgroundImage: `url(${picture})`,
                            borderRadius: "1rem",
                            boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)"
                          }}>
                            <div className="row">
                              {/* First Column */}
                              <div className="col-md-4 d-flex flex-column">
                                {selectedProject.images.filter((_, index) => index % 3 === 0).map((image, index) => (
                                  <div key={index} className="mb-4">
                                    <img 
                                      className="img-fluid rounded shadow photo" 
                                      src={image} 
                                      alt={`Class photo ${index * 3 + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Second Column */}
                              <div className="col-md-4 d-flex flex-column">
                                {selectedProject.images.filter((_, index) => index % 3 === 1).map((image, index) => (
                                  <div key={index} className="mb-4">
                                    <img 
                                      className="img-fluid rounded shadow photo" 
                                      src={image} 
                                      alt={`Class photo ${index * 3 + 2}`}
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Third Column */}
                              <div className="col-md-4 d-flex flex-column">
                                {selectedProject.images.filter((_, index) => index % 3 === 2).map((image, index) => (
                                  <div key={index} className="mb-4">
                                    <img 
                                      className="img-fluid rounded shadow photo" 
                                      src={image} 
                                      alt={`Class photo ${index * 3 + 3}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Project Details */}
                      <div>
                        <h5>About This Project</h5>
                        <p>{selectedProject.desc}</p>
                        <p className="text-muted">{selectedProject.details}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="card">
                    <div className="card-body text-center py-5">
                      <p className="text-muted mb-0">
                        Select a project from the list to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolProjects;