const Navbar = () => {
    return (
        // <nav class="nav">
        //     <h1>Ty Personal Profile</h1>
        //     <a href="/">Home</a>
        //     <a href="/About">About</a>
        //     <a href="/Portfolio">Portfolio</a>
        //     <a href="/Resume">Resume/CV</a>
        //     <a href="/Blog">Blog</a>
        //     <a href="/Contact">Contact</a>
        // </nav>
        // <nav class="navbar navbar-toggleable-md bg-info navbar-inverse nav"> 
        //     <ul class="nav navbar-nav"> 
        //         <li><a class="nav-item nav-link" href="/Home">Home</a></li> 
        //         <li><a class="nav-item nav-link" href="/Skills">Skills</a></li> 
        //         <li><a class="nav-item nav-link" href="/Projects">Projects</a></li > 
        //         <li><a class="nav-item nav-link" href="/Testimonials">Testimonials</a></li > 
        //         <li><a class="nav-item nav-link" href="/Contact">Contact</a></li > 
        //     </ul> 
        // </nav >
        <nav className="navbar navbar-expand-lg bg-background">
        <div className="container-fluid">
          {/* <a class="navbar-brand" href="#">Navbar</a> */}
          {/* <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button> */}
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
              <li className="nav-item">
                <a className="nav-link" href="/Testimonials">Testimonials</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/Contact">Contact</a>
              </li>
              {/* <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Dropdown
                </a>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">Action</a></li>
                    <li><a class="dropdown-item" href="#">Another action</a></li>

                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                </ul>
                </li>
              <li class="nav-item">
                <a class="nav-link disabled">Disabled</a>
              </li> */}
            </ul>
            {/* <form class="d-flex" role="search">
              <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
              <button class="btn btn-outline-success" type="submit">Search</button>
            </form> */}
          </div>
        </div>
      </nav>
    );
}

export default Navbar;