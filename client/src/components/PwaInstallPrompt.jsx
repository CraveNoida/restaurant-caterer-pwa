import { useEffect, useState } from "react";

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export default function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [installed, setInstalled] = useState(() => typeof window !== "undefined" && isStandalone());

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setInstallEvent(event);
      setCanInstall(!isStandalone());
    };
    const handleInstalled = () => {
      setCanInstall(false);
      setInstallEvent(null);
      setInstalled(true);
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    const choice = await installEvent.userChoice.catch(() => null);
    if (choice?.outcome === "accepted") {
      setCanInstall(false);
      setInstalled(true);
    }
    setInstallEvent(null);
  };

  if ((installed || !canInstall) && !isOffline) return null;

  return (
    <div className={isOffline ? "pwa-status-banner offline" : "pwa-status-banner"} role="status">
      {isOffline ? (
        <span>You are offline. Saved cart data remains available, but live updates and new orders need internet.</span>
      ) : canInstall ? (
        <>
          <span>Install Ahmad Caterers for a faster app-like experience.</span>
          <button type="button" onClick={installApp}>Install app</button>
        </>
      ) : null}
    </div>
  );
}
