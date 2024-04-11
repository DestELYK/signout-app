export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }
) => {
  if (date === undefined) return "None";

  if (typeof date === "string") date = new Date(date);

  return date.toLocaleString("en-US", options);
};

export const dateDiff = (date: string | Date) => {
  if (date === undefined) return 0;

  if (typeof date === "string") date = new Date(date);

  const now = new Date();
  const dayDiff = now.getDay() - date.getDay();

  let dateDiff = "";
  switch (dayDiff) {
    case 0:
      dateDiff = "Today";
      break;
    case 1:
      dateDiff = "Yesterday";
      break;
    case 7:
      dateDiff = "Last Week";
    default:
      dateDiff = `${dayDiff} days`;
      break;
  }

  return dateDiff;
};

export const fullName = ({
  firstName,
  lastName,
  nickname,
}: {
  firstName: string;
  lastName: string;
  nickname?: string | null;
}) => {
  return `${firstName} ${lastName}${nickname ? ` (${nickname})` : ""}`;
};

export const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
