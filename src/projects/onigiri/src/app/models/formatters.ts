import isNil from "lodash/isNil";

export function formatMoney(value: number | null) {
  if (isNil(value)) { return ''; }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  });
}

