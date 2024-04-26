import dayjs from "dayjs";

import isToday from 'dayjs/plugin/isToday.js';
import isYesterday from 'dayjs/plugin/isYesterday.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);

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

  return date.toLocaleString("en", options);
};

export const dateDiff = (date: string | Date, withoutSuffix: boolean = false) => {
  const now = new Date();

  const d = dayjs(date);

  if (d.isToday()) {
    return `Today`;
  } else if (d.isYesterday()) {
    return `Yesterday`;
  } else {
    return `${d.fromNow(withoutSuffix)}`
  }
};

export const formatFullName = ({
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
