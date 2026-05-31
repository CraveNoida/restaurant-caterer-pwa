import { useEffect } from "react";
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

  useEffect(() => {
    const config = getPwaAppConfig(location.pathname);
    let manifestLink = document.querySelector('link[rel="manifest"]');

    if (!manifestLink) {
      manifestLink = document.createElement("link");
      manifestLink.setAttribute("rel", "manifest");
      document.head.appendChild(manifestLink);
    }

    manifestLink.setAttribute("href", config.manifestHref);
    ensureMeta("theme-color").setAttribute("content", config.themeColor);
    ensureMeta("apple-mobile-web-app-title").setAttribute("content", config.appleTitle);
  }, [location.pathname]);

  return null;
}
