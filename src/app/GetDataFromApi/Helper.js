// utils/getCookie.js
export function getCookie(name) {
  if (typeof document === "undefined") return null; // avoid SSR crash

  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  if (match) return decodeURIComponent(match[2]);
  return null;
}
