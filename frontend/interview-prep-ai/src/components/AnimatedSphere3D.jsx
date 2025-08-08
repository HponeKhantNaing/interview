import React from 'react';
import './AnimatedSphere3D.css';

const AnimatedSphere3D = () => {
  return (
    <div className="sphere-container">
      <div className="sphere">
        {/* Meridians */}
        {Array.from({ length: 36 }, (_, i) => (
          <div key={`meridian-${i}`} className="meridian" style={{
            transform: `rotateX(${(i + 1) * 10}deg)`
          }}></div>
        ))}
        
        {/* Latitudes */}
        {Array.from({ length: 12 }, (_, i) => {
          const index = i + 37;
          let width, height, top, left, translateZ;
          
          if (index <= 42) {
            // First set of latitudes (negative Z)
            if (index === 37) { width = 296; height = 296; top = 2; left = 2; translateZ = -25; }
            else if (index === 38) { width = 280; height = 280; top = 10; left = 10; translateZ = -50; }
            else if (index === 39) { width = 260; height = 260; top = 20; left = 20; translateZ = -75; }
            else if (index === 40) { width = 220; height = 220; top = 40; left = 40; translateZ = -100; }
            else if (index === 41) { width = 160; height = 160; top = 70; left = 70; translateZ = -125; }
            else if (index === 42) { width = 20; height = 20; top = 140; left = 140; translateZ = -150; }
          } else {
            // Second set of latitudes (positive Z)
            if (index === 43) { width = 296; height = 296; top = 2; left = 2; translateZ = 25; }
            else if (index === 44) { width = 280; height = 280; top = 10; left = 10; translateZ = 50; }
            else if (index === 45) { width = 260; height = 260; top = 20; left = 20; translateZ = 75; }
            else if (index === 46) { width = 220; height = 220; top = 40; left = 40; translateZ = 100; }
            else if (index === 47) { width = 160; height = 160; top = 70; left = 70; translateZ = 125; }
            else if (index === 48) { width = 20; height = 20; top = 140; left = 140; translateZ = 150; }
          }
          
          return (
            <div 
              key={`latitude-${index}`} 
              className="latitude"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                top: `${top}px`,
                left: `${left}px`,
                transform: `rotateY(90deg) translateZ(${translateZ}px)`,
                border: index === 42 || index === 48 ? '10px solid black' : '1px solid rgba(0,0,0,0.25)'
              }}
            ></div>
          );
        })}
        
        {/* Axes */}
        <div className="axis"></div>
        <div className="axis" style={{ transform: 'rotateX(90deg)' }}></div>
      </div>
    </div>
  );
};

export default AnimatedSphere3D;
