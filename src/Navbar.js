const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg bg-background shadow">
            <div className="container-fluid">
                {/* Mobile hamburger button - only shows on screens smaller than lg */}
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarSupportedContent" 
                    aria-controls="navbarSupportedContent" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href="/Home">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/Skills">Skills</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/Projects">Projects</a>
                        </li>
                        {/* <li className="nav-item">
                            <a className="nav-link" href="/Testimonials">Testimonials</a>
                        </li> */}
                        <li className="nav-item">
                            <a className="nav-link" href="/Contact">Contact</a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;