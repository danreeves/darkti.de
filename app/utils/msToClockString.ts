/**
 * Convert milliseconds to hh:mm:ss format
 * @param {number} milliseconds - Milliseconds
 * @return {string} hh:mm:ss string with hh: omitted if less than 1 hour
 */

export const msToClockString = (milliseconds: number): string => {
	const dateFormatter = new Intl.DateTimeFormat("en-GB", {
		timeZone: "UTC",
		hour: milliseconds >= 3_600_000 ? "2-digit" : undefined,
		minute: "2-digit",
		second: "2-digit",
	})

	return dateFormatter.format(new Date(milliseconds))
}
