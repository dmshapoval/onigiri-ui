export function setUserHasOneePageCookie() {
  const now = new Date();
  const expiresDate = new Date(now.getTime() + 24 * 3600 * 90 * 1000).toUTCString();
  document.cookie = `oniPage=true; path=/; domain=onee.page; expires=${expiresDate}`;
}

export function dropUserHasOneePageCookie() {
  document.cookie = 'oniPage=; path=/; domain=onee.page; expires=Thu, 01 Jan 1970 00:00:00 UTC';
}

export function setUserProfileImageIdCookie(imageId: string) {
  const now = new Date();
  const expiresDate = new Date(now.getTime() + 24 * 3600 * 90 * 1000).toUTCString();
  document.cookie = `oniProfilePhotoId=${imageId}; path=/; domain=onee.page; expires=${expiresDate}`;
}

export function dropUserProfileImageIdCookie() {
  document.cookie = 'oniProfilePhotoId=; path=/; domain=onee.page; expires=Thu, 01 Jan 1970 00:00:00 UTC';
}