import { Suspense, lazy } from "react";

function retry(componentImport: any) {
  return new Promise<any>((resolve, reject) => {
    // check if the window has already been refreshed
    const hasRefreshed = JSON.parse(window.sessionStorage.getItem('retry-lazy-refreshed') || 'false');
    // try to import the component
    componentImport()
      .then((component: any) => {
        window.sessionStorage.setItem('retry-lazy-refreshed', 'false'); // success so reset the refresh
        resolve(component);
      })
      .catch((error: any) => {
        if (!hasRefreshed) {
          // not been refreshed yet
          window.sessionStorage.setItem('retry-lazy-refreshed', 'true'); // we are now going to refresh
          return window.location.reload(); // refresh the page
        }
        reject(error); // Default error behaviour as already tried refresh
      });
  });
}

const loadable = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  options?: { fallback?: React.ReactNode | null }
): any => {
  const { fallback = null } = options || {};
  const LazyComponent = lazy(() => retry(importFunc));

  return (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default loadable;