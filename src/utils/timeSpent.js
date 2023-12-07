function timeSpend(startTimestamp, endTimestamp) {
  const timeDifference =
    Math.abs(
      new Date(endTimestamp).getTime() - new Date(startTimestamp).getTime()
    ) / 1000; // in seconds

  const hours = Math.floor(timeDifference / 3600);
  const minutes = Math.floor((timeDifference % 3600) / 60);
  const seconds = Math.floor(timeDifference % 60);

  const formattedTime = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return formattedTime;
}

module.exports = timeSpend;
