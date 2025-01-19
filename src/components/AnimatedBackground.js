import React from 'react';
import image1 from '../pictures/porfolio_photos/animation_photos/image1.png';
import image3 from '../pictures/porfolio_photos/animation_photos/image3.png';
import image4 from '../pictures/porfolio_photos/animation_photos/image4.png';
import image5 from '../pictures/porfolio_photos/animation_photos/image5.png';

const AnimatedBackground = () => {
  return (
    <div className="animated-background">
      <div className="sliding-background"></div>
      <div className="sliding-background second"></div>
      <div className="overlay"></div>
      <style>{`
        .animated-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          z-index: 10;
          opacity: 0.7;
        }

        .sliding-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 400vw;
          height: 100vh;
          background: linear-gradient(45deg, 
            rgba(0, 0, 0, 0.6), 
            rgba(0, 0, 0, 0.4)
          ),
          url(${image1}) 0 0,
          url(${image3}) 100vw 0,
          url(${image4}) 200vw 0,
          url(${image5}) 300vw 0;
          background-size: contain;
          background-repeat: no-repeat;
          animation: slide 40s linear infinite;
        }

        .sliding-background.second {
          left: 400vw;
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(128, 103, 67, 0.65),
            rgba(188, 163, 127, 0.55)
          );
        }

        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-400vw);
          }
        }

        .animated-background::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to right,
            rgba(0, 0, 0, 0.2) 0%,
            rgba(0, 0, 0, 0) 5%,
            rgba(0, 0, 0, 0) 95%,
            rgba(0, 0, 0, 0.2) 100%
          );
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;