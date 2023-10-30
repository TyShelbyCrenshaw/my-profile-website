import backgroundImage from './pictures/imgonline-com-ua-TextureSeamless-JCI8TaR1FBycHm.jpg';
import picture from './pictures/FaceShot2.png';
const Home = () => {
    return (
    <div className="container mt-5" style={{width: "100vw", height: "100vh"}}>
        <div className='p-3 bg-tertiary shadow'> 
            <div className='bg-secondary m-3 p-5 shadow'>
                <div className="home container"> 
                <div className="row">
                <div className="col">
                        <img src={picture} />
                    </div>
                    <div className="col">
                        <h2>Ty Crenshaw</h2>
                        <p className='mt-5'>
                            My name is Ty Crenshaw and I am a 33-year-old software developer at Link Trust, a company that provides online marketing solutions. I have been working there for over three years, using the .NET Framework with an MVC front end and a MySQL database. I enjoy learning new things and keeping up with the latest technologies, especially in the field of artificial intelligence. In my spare time, I like to play video games with my wife, mainly Overwatch, and Beyond All Reason, we also like to take walks. I also have some hobbies like hiking and climbing, but I don’t do them as often as I used to. My goals are to improve my skills and knowledge as a developer, and to find new opportunities and challenges that can help me grow professionally and personally.
                        </p>
                    </div>
                </div>
            </div>
        </div>

 

        </div>
    </div>
 );
}

export default Home;