import { useState } from 'react';

/**
 * Keeps showing the last value while `active` is false, so content does not
 * disappear while a modal plays its closing animation.
 */
export function useRetainedValue<T>(value: T, active: boolean): T {
  const [retained, setRetained] = useState(value);

  if (active && retained !== value) {
    setRetained(value);
  }

  return active ? value : retained;
}
