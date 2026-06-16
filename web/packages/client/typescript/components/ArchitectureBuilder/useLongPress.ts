import { useCallback, useRef } from 'react';

const LONG_PRESS_MS = 600;

export function useLongPress(
  onLongPress: (x: number, y: number, target: Element) => void
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return; // primary button only
      const { clientX, clientY, target } = e;
      timerRef.current = setTimeout(() => {
        onLongPress(clientX, clientY, target as Element);
      }, LONG_PRESS_MS);
    },
    [onLongPress]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return {
    onPointerDown,
    onPointerUp: cancel,
    onPointerCancel: cancel,
    onPointerMove: cancel,
  };
}
