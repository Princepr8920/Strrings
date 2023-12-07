function getCurrentTime(time) {
  const now = new Date(time);
  
  // Get hours and minutes
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure 2-digit format
  
  // Determine AM or PM
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours || 12; // 12 AM is "12", not "0"
  
  // Combine hours, minutes, and AM/PM
  const timeString = `${hours}:${minutes} ${ampm}`;
  
  return timeString;
}

module.exports = getCurrentTime