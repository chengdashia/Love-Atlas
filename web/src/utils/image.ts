export function getPlaceholderImage(width: number, height: number, text?: string): string {
  const t = text ? encodeURIComponent(text) : `${width}x${height}`
  return `https://picsum.photos/seed/${t}/${width}/${height}`
}

export function isValidImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)/i.test(url) || url.includes('picsum.photos') || url.includes('api.dicebear.com')
}
