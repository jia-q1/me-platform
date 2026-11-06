import { useEffect, useState } from 'react';

export type DataState<T> =
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'error'; data: undefined; error: Error }
  | { status: 'ready'; data: T; error: undefined };

/**
 * Runs an async loader from ./api and tracks loading / error / ready.
 *
 *   const projects = useData(() => listProjects(), []);
 *
 * `deps` works like useEffect's dependency list: reload when they change.
 */
export function useData<T>(load: () => Promise<T>, deps: unknown[]): DataState<T> {
  const [state, setState] = useState<DataState<T>>({ status: 'loading', data: undefined, error: undefined });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading', data: undefined, error: undefined });
    load().then(
      (data) => !cancelled && setState({ status: 'ready', data, error: undefined }),
      (error: unknown) =>
        !cancelled &&
        setState({ status: 'error', data: undefined, error: error instanceof Error ? error : new Error(String(error)) }),
    );
    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}
