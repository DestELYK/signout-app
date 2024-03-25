
export const formatDate = (date: Date) => {
    if (date === undefined)
        return 'None';

    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}

export const dateDiff = (date: Date) => {
    if (date === undefined)
        return 0;

    const now = new Date();
    const dayDiff = now.getDay() - date.getDay();

    let dateDiff = ""
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
            dateDiff = `${dateDiff} days`;
            break;
    }

    return dateDiff;
}

export const fullName = ({firstName, lastName, nickname}: {firstName: string, lastName: string, nickname?: string | null}) => {
    return `${firstName} ${lastName}${nickname ? ` (${nickname})` : ''}`
}