const Projects = () => {
    return (     
        <div className="container mt-5" style={{width: "100vw", minHeight: "100vh", overflow: "auto"}}>
            <h1 className="text-accent">Projects</h1>
    
            <div className="d-flex justify-content-between">
                    <div className="mt-5 card col-5 shadow d">
                        <div className="card-header bg-primary text-tertiary">
                        </div>
                        <div className="card-body">
                            <a className="nav-link" href="/WorkProjects">Work</a>
                        </div>
                    </div>
                    <div className="mt-5 card col-5 shadow">
                        <div className="card-header bg-primary text-tertiary">
                        </div>
                        <div className="card-body">
                            <a className="nav-link" href="/SchoolProjects">School</a>
                        </div>
                    </div>
            </div>
        </div>
    );
}
 
export default Projects;