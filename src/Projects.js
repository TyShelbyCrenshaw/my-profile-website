import picture from './pictures/LinkTrustExample.png';
import picture2 from './pictures/LinkTrustExample2.png';

const Projects = () => {
    return ( 
    <div>
        <h2>Projects</h2>
        <div>
            <div>View my github <a href="github.com/TyShelbyCrenshaw">github.com/TyShelbyCrenshaw</a></div>
        </div>
        <div>
            <div>Link Trust Projects</div>
            <figure>
                <figcaption>
                    Ad Categories - A full stack project that uses CRUD operations for creating, reassigning, and deleting ad Categories.
                    <br></br>
                    There is also a full feature set of API to support the front end.
                </figcaption>
                <img src={picture} alt="Link Trust Example" />
            </figure>
            <figure>
                <figcaption>
                    One of the biggest projects I worked on was Transaction Details reports.
                    This report can filter by many criteria and can be exported to a CSV file.
                    You can also edit the report which has a ton of complexities to it.
                </figcaption>
                <img src={picture2} alt="Link Trust Example #2" />
            </figure>

        </div>
    </div> );
}
 
export default Projects;