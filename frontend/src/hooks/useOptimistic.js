import { useState, useCallback, useRef } from 'react';

export function useOptimistic(initialState) {
  const [data, setData] = useState(initialState);
  const rollbackRef = useRef(null);

  const optimisticUpdate = useCallback((predicted, actualPromise) => {
    const prev = data;
    setData(predicted);
    rollbackRef.current = () => setData(prev);
    return actualPromise
      .then((res) => {
        setData(res.data);
        rollbackRef.current = null;
        return res;
      })
      .catch((err) => {
        if (rollbackRef.current) rollbackRef.current();
        rollbackRef.current = null;
        throw err;
      });
  }, [data]);

  return [data, setData, optimisticUpdate];
}