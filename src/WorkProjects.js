import React from 'react';

// Images
import picture from './pictures/porfolio_photos/LinkTrustExample.png';
import picture2 from './pictures/porfolio_photos/LinkTrustExample2.png';
import picture3 from './pictures/porfolio_photos/UserRoles.png';

// Videos
// Note: Browsers struggle with .mkv. Highly recommend converting this to .mp4 for web use.
import reportVideo from './pictures/videos/DynamicReportEngine.mp4'; 

const WorkProjects = () => {
  return (
    <div className="container mt-5" style={{ width: "100vw", minHeight: "100vh", overflow: "auto" }}>
      <h2 className="text-accent mb-4">Work Projects</h2>

      <div className="mt-5 p-3 bg-tertiary shadow">
        <div className="bg-secondary m-3 p-5 shadow">
          {/* GitHub Section */}
          <div className="bg-primary p-4 rounded shadow-sm mb-5">
            <h5 className="text-tertiary mb-3">Connect With Me</h5>
            <div className="d-flex align-items-center">
              <svg height="24" width="24" viewBox="0 0 16 16" className="text-tertiary">
                <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              <a href="https://github.com/TyShelbyCrenshaw" className="text-accent ms-2 text-decoration-none">github.com/TyShelbyCrenshaw</a>
            </div>
          </div>

          {/* Link Trust Projects Section */}
          <h4 className="text-accent mb-4">Link Trust Projects</h4>

          {/* Project Cards */}
          <div className="project-cards">

            {/* --- FEATURED VIDEO PROJECT --- */}
            <div className="bg-tertiary p-4 rounded shadow-sm mb-5 border-start border-4 border-primary">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="text-accent mb-0">Dynamic Report Engine</h5>
                <span className="badge bg-primary text-tertiary">Featured</span>
              </div>
              
              <p className="mb-4">
                Designed and implemented a dynamic engine capable of generating complex reports on the fly. 
                This system improves data accessibility and reduces manual reporting overhead.
              </p>
              
              <div className="ratio ratio-16x9 bg-black rounded shadow">
                <video 
                  controls 
                  className="rounded"
                  style={{ width: '100%', height: '100%' }}
                >
                  <source src={reportVideo} type="video/mp4" />
                  {/* Fallback for MKV containers if browser supports it */}
                  <source src={reportVideo} type="video/x-matroska" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* --- EXISTING STATIC PROJECTS --- */}

            {/* User Roles Project */}
            <div className="bg-tertiary p-4 rounded shadow-sm mb-5">
              <h5 className="text-accent mb-3">User Roles Management System</h5>
              <div className="mb-4">
                <ul className="list-unstyled">
                  <li className="mb-2">• View existing roles organized by type (Client, Partner, Advertiser)</li>
                  <li className="mb-2">• Create new roles for any user type</li>
                  <li className="mb-2">• Edit existing roles' permissions</li>
                  <li className="mb-2">• Delete custom roles (but not default system roles)</li>
                </ul>
              </div>
              <img 
                className="rounded shadow-sm img-fluid mb-2" 
                style={{ width: "100%", maxWidth: "900px" }} 
                src={picture3} 
                alt="User Roles Interface" 
              />
            </div>

            {/* Ad Categories Project */}
            <div className="bg-tertiary p-4 rounded shadow-sm mb-5">
              <h5 className="text-accent mb-3">Ad Categories Management</h5>
              <p className="mb-4">
                A full-stack project implementing CRUD operations for ad categories management.
                Features a comprehensive API backend supporting all frontend operations.
              </p>
              <img 
                className="rounded shadow-sm img-fluid mb-2" 
                style={{ width: "100%", maxWidth: "900px" }} 
                src={picture} 
                alt="Ad Categories Interface" 
              />
            </div>

            {/* Transaction Details Project */}
            <div className="bg-tertiary p-4 rounded shadow-sm mb-5">
              <h5 className="text-accent mb-3">Transaction Details Reporting System</h5>
              <p className="mb-4">
                A comprehensive reporting system featuring:
                <br />• Advanced filtering capabilities
                <br />• CSV export functionality
                <br />• Complex inline editing system
              </p>
              <img 
                className="rounded shadow-sm img-fluid" 
                style={{ width: "100%", maxWidth: "900px" }} 
                src={picture2} 
                alt="Transaction Details Interface" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkProjects;