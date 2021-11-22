import { useCallback, useEffect, useRef, useState } from 'react';

type UseRecursiveTimeoutActions = {
  /**
   * Start interval.
   */
  play: () => void;
  /**
   * Stop interval.
   */
  stop: () => void;
};

type UseRecursiveTimeout = (
  /**
   * Callback call after delay timeout.
   */
  callback: () => void,
  /**
   * Timeout interval.
   *
   * @default 2000
   */
  delay?: number
) => UseRecursiveTimeoutActions;

const useRecursiveTimeout: UseRecursiveTimeout = (
  callback = () => {},
  delay = 2000
) => {
  const savedCallback = useRef(callback);

  const [playState, setPlayState] = useState<boolean>(false);

  const play = useCallback(() => setPlayState(true), []);
  const stop = useCallback(() => setPlayState(false), []);

  // Handle callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Handle play/stop actions.
  useEffect(() => {
    if (!playState) return;

    let id: NodeJS.Timeout | null = null;

    const tick = () => {
      if (!playState && id) {
        return clearTimeout(id);
      }

      savedCallback.current();
      requestAnimationFrame(() => (id = setTimeout(tick, delay)));
    };

    requestAnimationFrame(() => (id = setTimeout(tick, delay)));

    return () => {
      if (id) {
        clearTimeout(id);
      }

      stop();
    };
  }, [playState, delay]);

  return { play, stop };
};

export default useRecursiveTimeout;
