import { useCallback, useEffect, useState } from "react"

export function useAsync(func, dependencies = []) {
  const { execute, ...state } = useAsyncInternal(func, dependencies, true)

  useEffect(() => {
    execute()
  }, [execute])

  return state
}

export function useAsyncFn(asyncFunction, dependencies = []) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(null);

  const execute = useCallback(async (...args) => {
      setLoading(true);
      setError(null);
      setValue(null);
      try {
          const result = await asyncFunction(...args);
          setValue(result);
          return result;
      } catch (e) {
          setError(e);
          throw e;
      } finally {
          setLoading(false);
      }
  }, [asyncFunction, ...dependencies]);

  return [execute, { loading, error, value }];
}