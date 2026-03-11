export const getDeviceHeaders = () => {
  if (typeof window === 'undefined') return {} as Record<string, string>;
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const lang = navigator.language || '';
  const screenInfo = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
  const raw = `${ua}||${platform}||${lang}||${screenInfo}`;

  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const deviceId = `dev_${Math.abs(hash)}`;
  const deviceName = [platform, lang, screenInfo].filter(Boolean).join(' | ') || 'Browser';

  return {
    'X-Device-Id': deviceId,
    'X-Device-Name': deviceName
  };
};
