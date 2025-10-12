import { isNil } from "./common";

export function isEmpty(v: string | null | undefined) {
  return isNil(v) || v === '';
}
