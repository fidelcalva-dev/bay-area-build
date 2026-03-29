/**
 * Retry wrapper for dynamic imports that fail due to stale chunk hashes.
 * After a deploy, cached HTML may reference old JS chunks that no longer exist.
 * This retries the import once after a short delay, then forces a page reload
 * if the module still can't be fetched.
 */
export function lazyRetry<T extends { default: React.ComponentType<any> }>(
  importFn: () => Promise<T>,
  retries = 1,
): () => Promise<T> {
  return () =>
    new Promise<T>((resolve, reject) => {
      importFn()
        .then(resolve)
        .catch((error: Error) => {
          // Only retry on chunk/module fetch failures
          const isChunkError =
            error.message?.includes('Failed to fetch dynamically imported module') ||
            error.message?.includes('Loading chunk') ||
            error.message?.includes('Loading CSS chunk') ||
            error.message?.includes('error loading dynamically imported module');

          if (isChunkError && retries > 0) {
            // Wait briefly then retry — the browser may have cached the 404
            setTimeout(() => {
              lazyRetry(importFn, retries - 1)()
                .then(resolve)
                .catch(reject);
            }, 1500);
          } else if (isChunkError) {
            // All retries exhausted — reload to get fresh asset manifest
            const hasReloaded = sessionStorage.getItem('chunk-reload');
            if (!hasReloaded) {
              sessionStorage.setItem('chunk-reload', '1');
              window.location.reload();
            } else {
              sessionStorage.removeItem('chunk-reload');
              reject(error);
            }
          } else {
            reject(error);
          }
        });
    });
}
