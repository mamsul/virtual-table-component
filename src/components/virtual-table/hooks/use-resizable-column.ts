import { useCallback, useEffect, useRef, useState } from 'react';

interface ResizableColumnProps {
  currentWidth?: number;
  keyName?: string;
  columnIndex?: number;
  isFreezed?: boolean;
  onMouseUp?: (newSize: number) => void;
}

export default function useResizableColumn(props: ResizableColumnProps) {
  const { currentWidth, onMouseUp } = props;

  const boxRef = useRef<HTMLTableCellElement | null>(null);
  const [resizableWidth, setResizableWidth] = useState<number>(Number(currentWidth));
  const [isTempResize, setIsTempResize] = useState<boolean>(false);
  const resizableWidthRef = useRef(resizableWidth);

  useEffect(() => {
    setResizableWidth(Number(currentWidth));
  }, [currentWidth]);

  const handleMouseDown = () => {
    if (!boxRef.current) return;
    boxRef.current.requestPointerLock();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setIsTempResize(true);

    setResizableWidth((prevWidth) => {
      const newWidth = Math.max(32, prevWidth + e.movementX);
      resizableWidthRef.current = newWidth;
      return newWidth;
    });
  }, []);

  const handleMouseUp = () => {
    onMouseUp?.(resizableWidthRef.current);
    setIsTempResize(false);
    document.exitPointerLock();
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return { boxRef, handleMouseDown, resizableWidth, isTempResize };
}
