import { useEffect } from 'react';
import { KeyboardKeys } from '@/lib/accessibility';

interface UseKeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  enabled?: boolean;
}

/**
 * Hook for handling keyboard navigation
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions) {
  const {
    onEnter,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onHome,
    onEnd,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case KeyboardKeys.ENTER:
          if (onEnter) {
            e.preventDefault();
            onEnter();
          }
          break;
        case KeyboardKeys.ESCAPE:
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;
        case KeyboardKeys.ARROW_UP:
          if (onArrowUp) {
            e.preventDefault();
            onArrowUp();
          }
          break;
        case KeyboardKeys.ARROW_DOWN:
          if (onArrowDown) {
            e.preventDefault();
            onArrowDown();
          }
          break;
        case KeyboardKeys.ARROW_LEFT:
          if (onArrowLeft) {
            e.preventDefault();
            onArrowLeft();
          }
          break;
        case KeyboardKeys.ARROW_RIGHT:
          if (onArrowRight) {
            e.preventDefault();
            onArrowRight();
          }
          break;
        case KeyboardKeys.HOME:
          if (onHome) {
            e.preventDefault();
            onHome();
          }
          break;
        case KeyboardKeys.END:
          if (onEnd) {
            e.preventDefault();
            onEnd();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onHome, onEnd]);
}

/**
 * Hook for trapping focus within a container (for modals)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element on mount
    firstFocusable?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, enabled]);
}

/**
 * Hook for managing roving tabindex (for lists/grids)
 */
export function useRovingTabIndex(
  itemsRef: React.RefObject<HTMLElement[]>,
  activeIndex: number,
  setActiveIndex: (index: number) => void
) {
  useEffect(() => {
    const items = itemsRef.current;
    if (!items || items.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = activeIndex;
      let nextIndex = currentIndex;

      switch (e.key) {
        case KeyboardKeys.ARROW_DOWN:
        case KeyboardKeys.ARROW_RIGHT:
          e.preventDefault();
          nextIndex = (currentIndex + 1) % items.length;
          break;
        case KeyboardKeys.ARROW_UP:
        case KeyboardKeys.ARROW_LEFT:
          e.preventDefault();
          nextIndex = (currentIndex - 1 + items.length) % items.length;
          break;
        case KeyboardKeys.HOME:
          e.preventDefault();
          nextIndex = 0;
          break;
        case KeyboardKeys.END:
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      setActiveIndex(nextIndex);
      items[nextIndex]?.focus();
    };

    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
      }
    });

    const activeItem = items[activeIndex];
    activeItem?.addEventListener('keydown', handleKeyDown);

    return () => {
      activeItem?.removeEventListener('keydown', handleKeyDown);
    };
  }, [itemsRef, activeIndex, setActiveIndex]);
}
