import clsx from 'clsx';
import React from 'react';

interface ResizeIndicatorProps {
  onMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
  isMoving: boolean;
  left: number;
}

export default function ResizeIndicator(props: ResizeIndicatorProps) {
  const { onMouseDown, isMoving = false, left } = props;

  return (
    <>
      <div
        className={clsx(
          'w-1 h-full cursor-col-resize z-[9999] group-hover/outer:bg-blue-500/10',
          'fixed right-0 top-1/2 -translate-y-1/2'
        )}
        onMouseDown={onMouseDown}
      />

      {isMoving && (
        <div
          className="absolute bg-blue-500/10 z-[99999999999]"
          style={{ height: 1500, width: 4, left: left - 4 }}
        />
      )}
    </>
  );
}
