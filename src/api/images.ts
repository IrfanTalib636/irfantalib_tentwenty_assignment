const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export function getImageUrl(
  filePath: string | null | undefined,
  size = 'w500',
) {
  if (!filePath) {
    return null;
  }

  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
