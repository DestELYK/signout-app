import { Tag } from "@prisma/client";
import dayjs from "dayjs";

import duration from "dayjs/plugin/duration.js";
import isToday from "dayjs/plugin/isToday.js";
import isYesterday from "dayjs/plugin/isYesterday.js";
import relativeTime from "dayjs/plugin/relativeTime.js";

dayjs.extend(duration);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);

//#region Date Utils

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

export const dateDiff = (
  date: string | Date,
  withoutSuffix: boolean = false,
  otherDate?: string | Date
) => {
  const d = dayjs(date);

  if (d.isToday()) {
    return `Today`;
  } else if (d.isYesterday()) {
    return `Yesterday`;
  } else {
    return otherDate
      ? d.from(otherDate, withoutSuffix)
      : d.fromNow(withoutSuffix);
  }
};

export const formatDuration = (duration: number) => {
  return dayjs.duration({milliseconds: duration}).asDays().toFixed() + " days"
}

//#endregion


//#region String Utils

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

//#endregion


//#region Tag Utils

export const filterTags = (
  tags: Tag[],
  categories: string | string[] = [],
  blacklist: boolean = false
) => {
  return tags
    .filter((tag) => {
      let result = false;

      if (Array.isArray(categories)) {
        if (
          categories.length === 0 ||
          categories.includes(tag.category) === !blacklist
        )
          result = true;
      } else if (typeof categories === "string") {
        if (categories.length === 0) result = true;
        else if ((tag.category === categories) === !blacklist) result = true;
      }

      return result;
    })
    .sort((a, b) => b.priority - a.priority);
};

//#endregion
