import { useRegisterSW } from "virtual:pwa-register/react";

/** Registers the service worker (offline support) and offers updates when a new version is available. */
export function UpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) return null;
  return (
    <div className="toast no-print" role="status">
      {needRefresh ? (
        <>
          <span>A new version is available.</span>
          <button className="primary" onClick={() => updateServiceWorker(true)}>
            Reload
          </button>
        </>
      ) : (
        <span>Ready to work offline.</span>
      )}
      <button
        className="secondary"
        onClick={() => {
          setOfflineReady(false);
          setNeedRefresh(false);
        }}
      >
        Close
      </button>
    </div>
  );
}
