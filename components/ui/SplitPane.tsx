'use client';

import React, { useState, useCallback } from 'react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export interface SplitPaneProps {
  children: React.ReactNode;
  sidePanel?: React.ReactNode;
  sidePanelOpen?: boolean;
  onSidePanelClose?: () => void;
  sidePanelWidth?: number;
  sidePanelTitle?: string;
  className?: string;
}

export function SplitPane({
  children,
  sidePanel,
  sidePanelOpen = false,
  onSidePanelClose,
  sidePanelWidth = 400,
  sidePanelTitle,
  className,
}: SplitPaneProps) {
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(sidePanelWidth);

  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: React.MouseEvent | MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - mouseMoveEvent.clientX;
        if (newWidth > 300 && newWidth < 800) {
          setCurrentWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
      return () => {
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResizing);
      };
    }
  }, [isResizing, resize, stopResizing]);

  return (
    <div className={cn('flex h-full overflow-hidden', className)}>
      {/* Main Content */}
      <div
        className={cn(
          'flex-1 overflow-auto transition-all duration-300 ease-in-out',
          sidePanelOpen && 'pr-0'
        )}
      >
        {children}
      </div>

      {/* Side Panel */}
      {sidePanelOpen && (
        <>
          {/* Overlay for mobile */}
          <div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={onSidePanelClose}
          />

          {/* Panel */}
          <div
            className={cn(
              'fixed lg:relative inset-y-0 right-0 z-50 bg-white shadow-xl lg:shadow-none',
              'border-l border-gray-200 flex flex-col',
              'transition-transform duration-300 ease-in-out'
            )}
            style={{ width: currentWidth }}
          >
            {/* Resize Handle */}
            <div
              className={cn(
                'absolute left-0 top-0 bottom-0 w-1 cursor-col-resize',
                'hover:bg-blue-500 transition-colors',
                isResizing && 'bg-blue-500'
              )}
              onMouseDown={startResizing}
            />

            {/* Header */}
            {sidePanelTitle && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{sidePanelTitle}</h3>
                {onSidePanelClose && (
                  <button
                    onClick={onSidePanelClose}
                    className="p-1 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {sidePanel}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Slide-over panel variant for mobile-friendly side panels
export interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full',
};

export function SlideOver({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: SlideOverProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full bg-white shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          sizeClasses[size],
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors ml-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
