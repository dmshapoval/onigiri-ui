import { format, parse } from "date-fns";

const LOCAL_DATE_FORMAT = 'uuuu-MM-dd';
export function toLocalDateDto(date: Date) {
  return format(date, LOCAL_DATE_FORMAT);
}

export function toLocalDate(dto: string) {
  return parse(dto, LOCAL_DATE_FORMAT, new Date())
}