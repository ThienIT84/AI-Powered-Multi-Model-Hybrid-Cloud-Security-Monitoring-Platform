import { useRef, useEffect, useCallback } from "react";

/**
 * A custom hook to buffer high-frequency data events
 * and flush them in batches to prevent "render storms"
 */
export function useRealtimeBuffer<T>(
  onFlush: (bufferedData: T[]) => void,
  intervalMs = 400
) {
  const bufferRef = useRef<T[]>([]);
  const onFlushRef = useRef(onFlush);

  // Keep callback ref updated
  useEffect(() => {
    onFlushRef.current = onFlush;
  }, [onFlush]);

  // Push data into the buffer
  const queueEvent = useCallback((event: T) => {
    bufferRef.current.push(event);
  }, []);

  // Flush buffer periodically
  useEffect(() => {
    const timer = setInterval(() => {
      if (bufferRef.current.length > 0) {
        const dataToFlush = [...bufferRef.current];
        bufferRef.current = [];
        onFlushRef.current(dataToFlush);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return { queueEvent };
}
