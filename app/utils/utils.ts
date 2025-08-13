import dayjs from "dayjs";

import customParseFormat from "dayjs/plugin/customParseFormat.js";
import duration from "dayjs/plugin/duration.js";
import isToday from "dayjs/plugin/isToday.js";
import isYesterday from "dayjs/plugin/isYesterday.js";
import localeData from "dayjs/plugin/localeData.js";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { INVALID_STATUS_IDS, LOAN_STATUSES, STATUS_OPTIONS } from "./consts";
import { TagData } from "./types.server";

dayjs.extend(duration);
dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(localeData);

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

export const dateDiff = ({
    date,
    otherDate,
    withoutSuffix = false,
    skipToday = false,
    skipYesterday = false,
}: {
    date: string | Date;
    withoutSuffix?: boolean;
    otherDate?: string | Date;
    skipToday?: boolean;
    skipYesterday?: boolean;
}) => {
    const d = dayjs(date);

    if (!skipToday && d.isToday()) {
        return `Today`;
    } else if (!skipYesterday && d.isYesterday()) {
        return `Yesterday`;
    } else {
        return otherDate ? d.from(otherDate, withoutSuffix) : d.fromNow(withoutSuffix);
    }
};

export const formatDuration = (duration: number) => {
    return dayjs.duration({ milliseconds: duration }).humanize();
};

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
    tags: TagData[],
    categories: string | string[] = [],
    blacklist: boolean = false,
    showHidden: boolean = false
) => {
    return tags
        .filter((tag) => {
            let result = false;

            if (!showHidden && tag.hidden) return false;

            if (Array.isArray(categories)) {
                if (categories.length === 0 || categories.includes(tag.category) === !blacklist)
                    result = true;
            } else if (typeof categories === "string") {
                if (categories.length === 0) result = true;
                else if ((tag.category === categories) === !blacklist) result = true;
            }

            return result;
        })
        .sort((a, b) => {
            if (a.priority === b.priority) {
                return a.name.localeCompare(b.name);
            } else {
                return b.priority - a.priority;
            }
        });
};

//#endregion

export const isNumeric = (value: string) => /^\d+$/.test(value);

export function updateByMonth<T extends { month: string }>(
    monthList: T[],
    date: Date,
    initialize: (month: string, days: number) => T,
    handleExisting: (month: T, day: number, count: number) => void
) {
    const month = dayjs(date).format("MM-YYYY");
    const day = Number(dayjs(date).format("DD")) - 1;

    const existingMonth = monthList.find((m) => m.month === month);

    if (existingMonth) {
        handleExisting(existingMonth, day, 1);
    } else {
        const data = initialize(month, dayjs(month, "MM-YYYY").daysInMonth());

        handleExisting(data, day, 1);

        monthList.push(data);
    }
}

export function createOutstandingTag({
    out,
    category = "Item Status",
    outLabel = "Outstanding",
    inLabel = "Returned",
}: {
    out: boolean;
    category?: string;
    outLabel?: string;
    inLabel?: string;
}) {
    return {
        id: -1,
        name: out ? outLabel : inLabel,
        description: out ? "" : "",
        color: out ? "red" : "green",
        category: category,
        priority: -100,
        hidden: false,
    } as TagData;
}

export function parseNumber(
    value: any,
    defaultValue: number = 0,
    minValue: number = defaultValue,
    maxValue?: number
) {
    let newValue =
        value === null || value === undefined || Number.isNaN(Number(value))
            ? defaultValue
            : Number(value);

    if (newValue < 0) {
        newValue = minValue;
    }

    if (maxValue && newValue > maxValue) {
        newValue = maxValue;
    }

    return newValue;
}

export function getLoanStatus(statuses: string[]) {
    statuses = [...new Set(statuses)];
    let loanStatus = LOAN_STATUSES["returned"];
    if (INVALID_STATUS_IDS.some((id) => statuses.includes(id))) {
        loanStatus = LOAN_STATUSES["invalid"];
    } else if (statuses.some((id) => id === "outstanding" || id === "out")) {
        loanStatus = LOAN_STATUSES["outstanding"];
    }

    return loanStatus;
}

export function getItemStatus(statuses: string[]) {
    if (statuses.length === 0) {
        statuses = ["returned"];
    }

    if (statuses.filter((s) => s === "out" || INVALID_STATUS_IDS.includes(s)).length > 1) {
        throw new Error("Item has multiple invalid statuses");
    }

    statuses = [...new Set(statuses)];

    if (statuses.length > 1) {
        statuses = statuses.filter((s) => s !== "returned");
    }

    const status = STATUS_OPTIONS.find((status) => status.id === statuses[0]);

    if (!status) {
        throw new Error("Invalid status provided");
    }

    return status;
}
