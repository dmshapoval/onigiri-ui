import capitalize from 'lodash/capitalize';

export function getTitleFromUrl(url: string | null) {
  const cleanUrl = getCleanLinkUrl(url);

  if (!cleanUrl) {
    return '';
  }

  const result = cleanUrl.split('.')[0];

  return result ? capitalize(result) : '';
}

export function getCleanLinkUrl(url: string | null) {
  const parserdUrl = tryGetUrl(url);

  let result = parserdUrl ? parserdUrl.host : '';

  if (result.startsWith('www.')) {
    result = result.slice(4);
  }

  return result;
}

function tryGetUrl(url: string | null): URL | null {
  if (!url) {
    return null;
  }

  try {
    return new URL(url);
  } catch {
    return null;
  }
}
