import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPwaAppConfig } from "../utils/pwaAppConfig.js";

function ensureMeta(name) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  return meta;
}

export default function PwaManifestManager() {
  const location = useLocation();

  useLayoutEffect(() => {
    const config = getPwaAppConfig();
    let manifestLink = document.querySelector('link[rel="manifest"]');
    let iconLink = document.querySelector('link[rel="icon"]');
    let appleIconLink = document.querySelector('link[rel="apple-touch-icon"]');

    if (!manifestLink) {
      manifestLink = document.createElement("link");
      manifestLink.setAttribute("rel", "manifest");
      document.head.appendChild(manifestLink);
    }

    if (!iconLink) {
      iconLink = document.createElement("link");
      iconLink.setAttribute("rel", "icon");
      document.head.appendChild(iconLink);
    }

    if (!appleIconLink) {
      appleIconLink = document.createElement("link");
      appleIconLink.setAttribute("rel", "apple-touch-icon");
      document.head.appendChild(appleIconLink);
    }

    manifestLink.setAttribute("href", config.manifestHref);
    iconLink.setAttribute("href", config.iconHref);
    appleIconLink.setAttribute("href", config.iconHref);
    ensureMeta("theme-color").setAttribute("content", config.themeColor);
    ensureMeta("apple-mobile-web-app-title").setAttribute("content", config.appleTitle);
    window.__pwaCurrentAppType = config.appType;
    window.__pwaCurrentManifestHref = config.manifestHref;
    window.dispatchEvent(new CustomEvent("pwa-manifest-selected", { detail: config }));

    if (import.meta.env.DEV || window.localStorage?.getItem("pwa-debug") === "1") {
      console.info("PWA manifest selected:", config.manifestHref, "for", location.pathname);
    }
  }, [location.pathname]);

  return null;
}
