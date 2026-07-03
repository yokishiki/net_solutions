const longDateFormatter = new Intl.DateTimeFormat("ru", { dateStyle: "short", timeStyle: "short" }).format;
export function formatDate(date: string | Date): string | null {
	const timestamp = date instanceof Date ? date.getTime() : Date.parse(date);
	if(Number.isNaN(timestamp))
		return null;
	return longDateFormatter(timestamp);
}