import { match } from 'ts-pattern';

export function getMaxNumberOfLines(tileHeight: number) {
  return match(tileHeight)
    .with(1, () => 1)
    .with(2, () => 6)
    .otherwise(() => 17);
}
