import { useEffect } from 'react';

export default function useOnClickOutside(
  ref: React.RefObject<HTMLDivElement | HTMLElement | null>,
  handler: (currentTarget?: HTMLElement | null, el?: HTMLDivElement | HTMLElement) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref?.current) return;
      if (!ref.current || ref.current.contains(event.target as HTMLDivElement)) return;
      handler(event.target as HTMLElement, ref.current);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
