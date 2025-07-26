import React, { useEffect, useState } from 'react';

const Timer = ({ 
  initialTime, 
  onExpire, 
  showWarning = true, 
  warningThreshold = 300, // 5 minutes
  className = "",
  isStopped = false
}) => {
  const [timer, setTimer] = useState(initialTime);
  const [isExpired, setIsExpired] = useState(false);

  // Format timer as 00:00:00
  const formatTimer = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h} : ${m} : ${s}`;
  };

  // Timer effect
  useEffect(() => {
    if (timer <= 0) {
      setIsExpired(true);
      if (onExpire) onExpire();
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, onExpire]);

  // Update timer when initialTime changes
  useEffect(() => {
    setTimer(initialTime);
    setIsExpired(false);
  }, [initialTime]);

  if (isExpired) {
    return (
      <div className={`text-red-500 font-bold ${className}`}>
        Time's Up!
      </div>
    );
  }

  if (isStopped) {
    return (
      <div className={`text-green-600 font-bold ${className}`}>
        Submitted
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={`text-4xl font-bold ${
        timer <= warningThreshold ? 'text-red-500 animate-pulse' : 'text-orange-500'
      }`}>
        {formatTimer(timer)}
      </div>
      {showWarning && timer <= warningThreshold && timer > 0 && (
        <div className="text-red-600 text-sm font-medium mt-2">
          ⚠️ Less than 5 minutes remaining!
        </div>
      )}
    </div>
  );
};

export default Timer; 