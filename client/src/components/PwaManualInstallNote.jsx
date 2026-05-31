import { useEffect, useState } from "react";
import { getPwaAppConfig } from "../utils/pwaAppConfig.js";

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export default function PwaManualInstallNote() {
  const pwaConfig = getPwaAppConfig();
  const [showNote, setShowNote] = useState(false);
  const [showFallbackHelp, setShowFallbackHelp] = useState(false);

  useEffect(() => {
    setShowNote(false);
    if (pwaConfig.appType === "customer" || isStandalone()) return undefined;

    const hasRouteInstallPrompt = () =>
      window.__pwaInstallPromptEvent && window.__pwaInstallPromptAppType === pwaConfig.appType;

    const revealTimer = window.setTimeout(() => {
      setShowNote(!hasRouteInstallPrompt());
    }, 1800);

    const handleInstallAvailable = () => setShowNote(!hasRouteInstallPrompt());
    const handleInstalled = () => setShowNote(false);

    window.addEventListener("pwa-install-available", handleInstallAvailable);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.clearTimeout(revealTimer);
      window.removeEventListener("pwa-install-available", handleInstallAvailable);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, [pwaConfig.appType]);

  if (!showNote) return null;

  const installApp = async () => {
    const event = window.__pwaInstallPromptEvent;
    const eventAppType = window.__pwaInstallPromptAppType;

    if (event && eventAppType === pwaConfig.appType) {
      event.prompt();
      const choice = await event.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") setShowNote(false);
      window.__pwaInstallPromptEvent = null;
      window.__pwaInstallPromptAppType = null;
      return;
    }

    setShowFallbackHelp(true);
  };

  return (
    <div className="pwa-manual-install-note">
      <span>
        <strong>{pwaConfig.title}</strong>
        <small>{pwaConfig.appType === "admin" ? "Opens directly to /admin/login." : "Opens directly to /delivery/login."}</small>
      </span>
      <button type="button" onClick={installApp}>Install App</button>
      {showFallbackHelp && (
        <small className="pwa-manual-help">
          Browser install prompt is not available right now. Open browser menu and tap Add to Home screen.
        </small>
      )}
    </div>
  );
}
