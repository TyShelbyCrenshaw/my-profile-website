import picture from './pictures/LinkTrustExample.png';
import picture2 from './pictures/LinkTrustExample2.png';

const Projects = () => {
    return ( 
    <div className="container mt-5" style={{width: "100vw", minHeight: "100vh", overflow: "auto"}}>
        <h2>Projects</h2>

        <div className='mt-5 p-3 bg-tertiary shadow'> 
            <div className='bg-secondary m-3 p-5 shadow'>
                <div className='mt-2'>
                    <div>View my github: <a href="https://github.com/TyShelbyCrenshaw">github.com/TyShelbyCrenshaw</a></div>
                </div>
                <div className='mt-5'>Link Trust Projects</div>
                <figure className='mt-2'>
                    <figcaption>
                        Ad Categories - A full stack project that uses CRUD operations for creating, reassigning, and deleting ad Categories.
                        <br></br>
                        There is also a full feature set of API to support the front end.
                    </figcaption>
                    <img className='mt-2 shadow img-fluid' style={{width:"900px"}} src={picture} alt="Link Trust Example" />
                </figure>
                <figure className='mt-5'>
                    <figcaption>
                        One of the biggest projects I worked on was Transaction Details reports.
                        This report can filter by many criteria and can be exported to a CSV file.
                        You can also edit the report which has a ton of complexities to it.
                    </figcaption>
                    <img className='mt-2 shadow img-fluid' style={{width:"900px"}} src={picture2} alt="Link Trust Example #2" />
                </figure>   
            </div>
        </div>
    </div> );
}
 
export default Projects;