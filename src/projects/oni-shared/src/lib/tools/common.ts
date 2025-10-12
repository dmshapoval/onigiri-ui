import * as Eq from 'fp-ts/es6/Eq';


export function isNil<T>(v: T | null | undefined): v is null | undefined {
  return v === null || v === undefined;
}

export function exhaustiveCheck(value: never) {
  let message = typeof value === 'object'
    ? JSON.stringify(value)
    : (<any>value)?.toString();

  console.error(`Unexpected value ${message}`);
  console.error(value)
}

export class UnexpectedValueError extends Error {
  constructor(value: any) {
    let message = typeof value === 'object' ? JSON.stringify(value) : value?.toString();

    super(`Unexpected value ${message}`);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, UnexpectedValueError.prototype);
  }
}

export function isNotNil<T>(v: T | null | undefined): v is T {
  return !isNil(v);
}

export function isTruthy(v: any) {
  return !!v;
}

export function isFalsy(v: any) {
  return !v;
}

export function delay(timeout: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  })
}


export function withNullCheck<T>(eq: Eq.Eq<T>): Eq.Eq<T | null> {
  return {
    equals(x: T | null, y: T | null) {
      const xIsNull = isNil(x);
      const yIsNull = isNil(y);

      if (xIsNull && yIsNull) {
        return true;
      }

      if (xIsNull && !yIsNull) {
        return false;
      }

      if (!xIsNull && yIsNull) {
        return false
      }

      return eq.equals(x as T, y as T);
    }
  }
}

export const dateTimeComparer: Eq.Eq<Date> = {
  equals(x, y) {
    return x.getTime() === y.getTime();
  }
}

type PrimitiveValue = number | string | Date | boolean | null | undefined;

export function groupBy<T, K extends PrimitiveValue>(src: T[], keySelector: (x: T) => K): Map<K, T[]> {

  const grouped = new Map<K, T[]>();

  src.forEach(item => {
    const key = keySelector(item);
    const fromResult = grouped.get(key) || [];
    fromResult.push(item);
    grouped.set(key, fromResult);
  });


  return grouped;
}

export function ensureUrlProtocol(url: string) {
  const hasProtocol = url.startsWith('http://') || url.startsWith('https://');

  return hasProtocol ? url : `https://${url}`;
}

export function getCurrentUrlWithExtraQueryParams(data: { [key: string]: (string | boolean | number) }) {
  const url = new URL(window.location.href);

  Object.keys(data)
    .forEach(key => {

      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
      }

      url.searchParams.append(key, data[key].toString())
    });

  return url.toString()
}