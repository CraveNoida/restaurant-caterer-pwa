import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPwaAppConfig } from "../utils/pwaAppConfig.js";

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export default function PwaInstallPrompt() {
  const location = useLocation();
  const pwaConfig = getPwaAppConfig(location.pathname);
  const [installEvent, setInstallEvent] = useState(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [installed, setInstalled] = useState(() => typeof window !== "undefined" && isStandalone());

  useEffect(() => {
    const applyInstallEvent = (event) => {
      const eventAppType = window.__pwaInstallPromptAppType || window.__pwaCurrentAppType || pwaConfig.appType;
      if (eventAppType !== pwaConfig.appType) {
        setInstallEvent(null);
        setCanInstall(false);
        return;
      }
      setInstallEvent(event);
      setCanInstall(!isStandalone());
    };
    const handleBeforeInstall = (event) => {
      event.preventDefault();
      window.__pwaInstallPromptEvent = event;
      window.__pwaInstallPromptAppType = window.__pwaCurrentAppType || pwaConfig.appType;
      applyInstallEvent(event);
    };
    const handleInstallAvailable = () => {
      if (window.__pwaInstallPromptEvent) applyInstallEvent(window.__pwaInstallPromptEvent);
    };
    const handleInstalled = () => {
      setCanInstall(false);
      setInstallEvent(null);
      setInstalled(true);
    };
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (window.__pwaInstallPromptEvent) applyInstallEvent(window.__pwaInstallPromptEvent);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("pwa-install-available", handleInstallAvailable);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("pwa-install-available", handleInstallAvailable);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pwaConfig.appType]);

  useEffect(() => {
    const eventAppType = window.__pwaInstallPromptAppType || window.__pwaCurrentAppType;
    if (window.__pwaInstallPromptEvent && eventAppType === pwaConfig.appType) {
      setInstallEvent(window.__pwaInstallPromptEvent);
      setCanInstall(!isStandalone());
      return;
    }
    setInstallEvent(null);
    setCanInstall(false);
  }, [pwaConfig.appType]);

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
          <span>
            <strong>{pwaConfig.title}</strong>
            <small>{pwaConfig.subtitle}</small>
            <small>Start URL: {pwaConfig.startUrl}</small>
          </span>
          <div className="pwa-status-actions">
            <button type="button" onClick={installApp}>Install App</button>
            <button type="button" className="pwa-secondary-action" onClick={() => setCanInstall(false)}>
              Maybe Later
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
