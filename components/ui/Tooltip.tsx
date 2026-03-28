'use client';

import { useState, useRef, ReactNode, ReactElement } from 'react';

export interface TooltipProps {
  content: string | ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: ReactElement;
}

export function Tooltip({
  content,
  placement = 'top',
  delay = 400,
  children,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const placementStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent',
  };

  return (
    <div className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}

      {isVisible && (
        <div
          className={`
            absolute z-50
            ${placementStyles[placement]}
            pointer-events-none
          `}
        >
          <div
            className="
              px-3 py-2
              bg-gray-900 text-white text-sm
              rounded-md shadow-lg
              max-w-xs
              animate-in fade-in duration-150
            "
          >
            {content}
            <div
              className={`
                absolute w-0 h-0
                border-4
                ${arrowStyles[placement]}
              `}
            />
          </div>
        </div>
      )}
    </div>
  );
}
