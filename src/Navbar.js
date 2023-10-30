const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg bg-background shadow">
        <div className="container-fluid">
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