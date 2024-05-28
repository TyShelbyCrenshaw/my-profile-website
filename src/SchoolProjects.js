//import React from 'react';
import picture from './pictures/porfolio_photos/background2.jpg';

// Using require.context to import all images from a folder
const images = require.context('./pictures/class_photos', false, /\.(jpg|JPG|jpeg)$/);

const SchoolProjects = () => {
  // Creating an array of image URLs
  const images = require.context('./pictures/class_photos', false, /\.(jpg|JPG|jpeg)$/);

  const imageList = images.keys().map((image) => {
    return images(image);
  });
    console.log(imageList);
  return (
    <div>
      <div className="container mt-5" style={{ width: "100vw", minHeight: "100vh", overflow: "auto" }}>
        <h1 className="text-accent">School Projects</h1>
        <div>

        </div>
        <div>
          
        </div>
        <div>
         
        </div>
        <div className="mt-5 card w-75 shadow">
            <div className="card-header bg-primary text-tertiary">
                What is my schooling and where am I going?
            </div>
            <div className="card-body card- bg-tertiary">
                <blockquote className="blockquote mb-0">
                <p>I have completed a Bachelors of Science in Computer Science</p>
                <p>I am currently working on Bachelor of Science with a major in Art and Design</p>
                <p>Here are some of my photos from my current photography class</p>
                </blockquote>
            </div>
        </div>

        <div className="mt-5 container-fluid moodboard"  style={{ backgroundImage: `url(${picture})` }}>
        <div className="row">
            <div className="col-md-4 d-flex flex-column">
            {imageList.slice(0, Math.ceil(imageList.length / 3)).map((image, index) => (
                <img className="img-fluid mt-3 photo" src={image} alt={`Class photo ${index + 1}`} key={index} />
            ))}
            </div>
            <div className="col-md-4 d-flex flex-column">
            {imageList.slice(Math.ceil(imageList.length / 3), Math.ceil(2 * imageList.length / 3)).map((image, index) => (
                <img className="img-fluid mt-3 photo" src={image} alt={`Class photo ${Math.ceil(imageList.length / 3) + index + 1}`} key={index} />
            ))}
            </div>
            <div className="col-md-4 d-flex flex-column">
            {imageList.slice(Math.ceil(2 * imageList.length / 3)).map((image, index) => (
                <img className="img-fluid mt-3 photo" src={image} alt={`Class photo ${Math.ceil(2 * imageList.length / 3) + index + 1}`} key={index} />
            ))}
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default SchoolProjects;

