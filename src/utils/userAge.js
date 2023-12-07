const isUserOldEnough = (value) => {
  // Calculate the age based on the provided date
  const userBirthdate = new Date(value);
  const ageInMilliseconds = Date.now() - userBirthdate.getTime();
  const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

  // Check if the user is at least 16 years old
  return ageInYears >= 16;
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const tooOld = (value) => {
  const userBirthdate = new Date(value);
  return userBirthdate.getFullYear() >= 1900;
};

module.exports = { isUserOldEnough, tooOld, formatDate };
