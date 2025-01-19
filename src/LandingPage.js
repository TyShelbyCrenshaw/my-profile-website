const LandingPage = () => {
    return ( 
        <div className="container pt-5" style={{width: "100vw", minHeight: "100vh", overflow: "auto", zIndex: 20, position: "sticky"}}>
            <div className="p-5 bg-secondary shadow animate__animated animate__fadeIn animate__delay-1s"> 
                <div className="p-5 bg-background shadow" style={{color:"#FFF2D8"}}>
                    <h1 className="text-tertiary display-1 fw-bold animate__animated animate__slideInDown" 
                        style={{ letterSpacing: "0.4em", color:"#FFF2D8"}}>
                        Ty Crenshaw
                    </h1>
                    <br />
                    <br />
                    <div className="text-tertiary p-3 animate__animated animate__fadeInLeft animate__delay-2s">
                        Software Developer
                    </div>
                    <br />
                    <div className="text-tertiary p-3 animate__animated animate__fadeInLeft animate__delay-3s">
                        Always curious, always learning
                    </div>
                    <br />
                    <div className="text-tertiary p-3 animate__animated animate__fadeInLeft animate__delay-4s">
                        Nature lover, occasional adventurer
                    </div>
                    <div style={{marginTop:"20px"}}>
                        <button type="button" 
                                className="btn btn-light animate__animated animate__bounceIn animate__delay-5s"
                                onClick={() => window.location.href = "/Home"}>
                            Explore
                        </button>
                    </div>   
                </div>
            </div>
        </div>
    );
}
 
export default LandingPage;