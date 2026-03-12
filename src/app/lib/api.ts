const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
const apiBase = rawApiBase.replace(/\/+$/, '');
const resolvedApiBase = (() => {
  if (!apiBase) return '';
  if (typeof window === 'undefined') return apiBase;
  try {
    const apiUrl = new URL(apiBase);
    if (window.location?.origin && apiUrl.origin !== window.location.origin) {
      return '';
    }
  } catch {
    // Keep apiBase if it's not a valid URL.
  }
  return apiBase;
})();

export const toApiUrl = (path: string) => {
  if (!path) return resolvedApiBase;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (!path.startsWith('/')) {
    return resolvedApiBase ? `${resolvedApiBase}/${path}` : `/${path}`;
  }
  return resolvedApiBase ? `${resolvedApiBase}${path}` : path;
};

export const toAssetUrl = (url: string) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/uploads/') || url.startsWith('/api/')) {
    return toApiUrl(url);
  }
  return url;
};
