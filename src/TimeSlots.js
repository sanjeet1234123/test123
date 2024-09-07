// src/TimeSlots.js
import React from 'react';

const TimeSlots = ({ timeSlots, selectedTime, setSelectedTime }) => {
  return (
    <div className="time-slots">
      {timeSlots.map((time, index) => (
        <button
          key={index}
          className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
          onClick={() => setSelectedTime(time)}
        >
          {time}
        </button>
      ))}
    </div>
  );
};

export default TimeSlots;
