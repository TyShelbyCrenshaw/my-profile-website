
const LandingPage = () => {
    return ( 
        <div className="container pt-5" style={{width: "100vw", minHeight: "100vh", overflow: "auto"}}>
            <div className="p-5 bg-secondary shadow"> 
                <div className="p-5 bg-background shadow" style={{color:"#FFF2D8"}}>
                    <h1 className="text-tertiary display-1  fw-bold" style={{ letterSpacing: "0.4em", color:"#FFF2D8"}}>
                        Ty Crenshaw
                    </h1>
                    <br />
                    <br />
                    <div className="text-tertiary p-3">Software Developer</div>
                    <br />
                    <div className="text-tertiary p-3">Always curious, always learning</div>
                    <br />
                    <div className="text-tertiary p-3">Nature lover, occasional adventurer</div>
                    <div style={{marginTop:"20px"}}>
                        <button type="button" className="btn btn-light" onClick={() => window.location.href = "/Home"}>
                            Explore
                        </button>
                    </div>   
                </div>

            </div>

        </div>

     );
}
 
export default LandingPage;