export function isSvgCover(src: string): boolean {
  return src.toLowerCase().endsWith(".svg");
}

export function coverImageLoadingProps(src: string): { unoptimized: boolean } {
  return { unoptimized: isSvgCover(src) };
}
