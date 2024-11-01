import React, { useState } from "react";
import DatePicker from "react-date-picker";

const DateTimePicker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div style={{ margin: "20px", textAlign: "center" }}>
      <h2>Select a Date and Time</h2>
      <DatePicker
        onChange={handleDateChange}
        value={selectedDate}
        calendarIcon={null}
        clearIcon={null}
        format="y-MM-dd h:mm:ss a"
        showLeadingZeros
      />
      <div style={{ marginTop: "20px" }}>
        <h3>Selected Date and Time:</h3>
        <p>{selectedDate.toString()}</p>
      </div>
    </div>
  );
};

export default DateTimePicker;

// This is a future addition but not for now otherwise i would be still busy for days
