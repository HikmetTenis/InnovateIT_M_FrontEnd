import React, { useState, useEffect } from 'react';

const CircularTimer = ({ duration,updateData }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const radius = 4; // Adjusted radius for the 10px circle
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (duration >= 0){
      const interval = setInterval(() => {
        setTimeElapsed((prev) => {
          if (prev >= duration || updateData !== 0) {
            updateData = 0
            return 0; // Reset after reaching the full duration
          }
          return prev + 0.1; // Increment every 100ms
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [duration,updateData]);

  const progress = (timeElapsed / duration) * 100; // Progress as percentage
  const dashOffset = circumference - (progress / 100) * circumference; // Properly calculate stroke dash offset

  return (
    <div className="circular-timer">
      <svg height="10" width="10"> {/* Set the circle size to 10px */}
        <circle
          className="circle-background"
          stroke="gray"
          strokeWidth="1"
          fill="transparent"
          r={radius}
          cx="5"
          cy="5"
        />
        <circle
          className="circle-progress"
          stroke="green"
          strokeWidth="1"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          fill="transparent"
          r={radius}
          cx="5"
          cy="5"
        />
      </svg>
    </div>
  );
};

export default CircularTimer;
