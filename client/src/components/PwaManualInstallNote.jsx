import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getPwaAppConfig } from "../utils/pwaAppConfig.js";

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

export default function PwaManualInstallNote() {
  const location = useLocation();
  const pwaConfig = getPwaAppConfig(location.pathname);
  const [showNote, setShowNote] = useState(false);

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

  return (
    <p className="pwa-manual-install-note">
      To install this app, open browser menu and tap Add to Home screen.
    </p>
  );
}
