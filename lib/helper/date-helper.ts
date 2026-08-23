export function toDatetimeLocalValue(value: unknown): string {
    if (!value) return "";

    const d = new Date(value as Date | string);

    if (isNaN(d.getTime())) return "";

    const pad = (n: number) => String(n).padStart(2, "0");

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}