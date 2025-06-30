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
