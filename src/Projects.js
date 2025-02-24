import React, { useState } from 'react';
import WorkProjects from './WorkProjects';
import SchoolProjects from './SchoolProjects';
import ForFunProjects from './ForFunProjects';

const Projects = () => {
  const [activeTab, setActiveTab] = useState('work');

  return (
    <div className="container mt-5" style={{width: "100vw", minHeight: "100vh", overflow: "auto"}}>
      <h1 className="text-accent mb-4">Projects</h1>

      {/* Tab Navigation */}
      <div className="d-flex mb-4">
        <button 
          className={`btn ${activeTab === 'work' ? 'btn-primary' : 'btn-secondary'} me-2`}
          onClick={() => setActiveTab('work')}
        >
          Work Projects
        </button>
        <button 
          className={`btn ${activeTab === 'school' ? 'btn-primary' : 'btn-secondary'} me-2`}
          onClick={() => setActiveTab('school')}
        >
          School Projects
        </button>
        <button 
          className={`btn ${activeTab === 'forFun' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('forFun')}
        >
          For Fun
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        <div className={`tab-pane fade ${activeTab === 'work' ? 'show active' : ''}`}>
          <WorkProjects />
        </div>
        <div className={`tab-pane fade ${activeTab === 'school' ? 'show active' : ''}`}>
          <SchoolProjects />
        </div>
        <div className={`tab-pane fade ${activeTab === 'forFun' ? 'show active' : ''}`}>
          <ForFunProjects />
        </div>
      </div>
    </div>
  );
};

export default Projects;