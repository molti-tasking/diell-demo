/**
 * Formatting in incoming time string so it loses its trailing seconds.
 *
 * @param timeString "HH:mm:ss"
 * @returns
 */
export const formatTime = (timeString: string | null | undefined) => {
  if (!timeString) return timeString;
  const parts = timeString.split(":");
  const hours = parts[0].padStart(2, "0");
  const minutes = parts[1].padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const getDateFromTime = (timeString: string) => {
  // Get the current date
  const currentDate = new Date();

  // Split the time string into components
  const [hours, minutes, seconds] = timeString.split(":").map(Number);

  // Set the hours, minutes, and seconds of the current date
  currentDate.setHours(hours, minutes, seconds, 0);

  return currentDate;
};
