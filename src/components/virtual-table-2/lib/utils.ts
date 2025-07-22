export function calculateFixedCardPosition(rect: DOMRect, cardHeight: number = 280) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let calculatedLeft = rect.left - 150;
  let calculatedTop = rect.bottom;

  if (calculatedLeft < 0) calculatedLeft = 10;
  if (calculatedLeft + 300 > viewportWidth) calculatedLeft = viewportWidth - 220;
  if (calculatedTop + cardHeight > viewportHeight) {
    calculatedTop = viewportHeight - cardHeight;
  }

  return { calculatedTop, calculatedLeft };
}

export function getObjKeyByValue(object: Record<string, string | number>, value: string | number) {
  return Object.keys(object).find((key) => object[key] === value);
}

/**
 * Menghitung lebar scrollbar pada elemen dengan ref yang diberikan.
 * dengan cara mengurangi offsetWidth dengan clientWidth.
 * Jika elemen tidak ada, kembalikan 0.
 */
export function getScrollbarWidth(ref: React.RefObject<HTMLDivElement | null>) {
  if (!ref.current) return 0;
  return ref.current.offsetWidth - ref.current.clientWidth;
}

/**
 * Menghitung overflow element terhadap viewport pada setiap sisi.
 * @param top posisi atas element (px)
 * @param left posisi kiri element (px)
 * @param width lebar element (px)
 * @param height tinggi element (px)
 * @returns object { top, right, bottom, left } (nilai >0 berarti overflow, <=0 berarti tidak overflow)
 */
export function calculateElementOverflow(rect: DOMRect, cardWidth: number, cardHeight: number) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const right = viewportWidth - (viewportWidth - (rect.left + cardWidth));
  const bottom = viewportHeight - (rect.top + cardHeight);

  return { right, bottom };
}
