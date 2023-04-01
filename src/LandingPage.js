const LandingPage = () => {
    return ( 
        <div class="container" style={{marginTop: "250px"}}>
            <h1 style={{letterSpacing: "0.4em"}}>
                Ty Crenshaw
            </h1>
            <br />
            <br />
            <div>Software Developer</div>
            <br />
            <div>Always curious, always learning</div>
            <br />
            <div>Nature lover, occasional adventurer</div>
            <div style={{marginTop:"20px"}}>
                <button onClick={() => window.location.href = "/Home"}>
                    Explore
                </button>
            </div>
        </div>

     );
}
 
export default LandingPage;