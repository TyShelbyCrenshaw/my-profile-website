
const LandingPage = () => {
    return ( 
        <div className="container" style={{paddingTop: "250px", width: "100vw", height: "100vh"}}>
            <h1 className="text-white display-1 p-3 fw-bold" style={{letterSpacing: "0.4em"}}>
                Ty Crenshaw
            </h1>
            <br />
            <br />
            <div className="text-light p-3">Software Developer</div>
            <br />
            <div className="text-light p-3">Always curious, always learning</div>
            <br />
            <div className="text-light p-3">Nature lover, occasional adventurer</div>
            <div style={{marginTop:"20px"}}>
                <button type="button" className="btn btn-light" onClick={() => window.location.href = "/Home"}>
                    Explore
                </button>
            </div>
        </div>

     );
}
 
export default LandingPage;