const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
const apiBase = rawApiBase.replace(/\/+$/, '');

export const toApiUrl = (path: string) => {
  if (!path) return apiBase;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (!path.startsWith('/')) {
    return apiBase ? `${apiBase}/${path}` : `/${path}`;
  }
  return apiBase ? `${apiBase}${path}` : path;
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

