import { getAppMode } from "./appMode.js";

const PWA_APPS = {
  customer: {
    appType: "customer",
    manifestHref: "/manifest.json",
    startUrl: "/",
    iconHref: "/icons/icon-192.png",
    themeColor: "#15110d",
    appleTitle: "Ahmad Caterers",
    title: "Install Ahmad Caterers App",
    subtitle: "Order food and book catering faster from your home screen."
  },
  admin: {
    appType: "admin",
    manifestHref: "/admin-manifest.json",
    startUrl: "/admin/login",
    iconHref: "/icons/admin-icon-192.png",
    themeColor: "#111827",
    appleTitle: "Ahmad Admin",
    title: "Install Admin App",
    subtitle: "Manage orders, menu, bookings, payments, and delivery from your dashboard."
  },
  delivery: {
    appType: "delivery",
    manifestHref: "/delivery-manifest.json",
    startUrl: "/delivery/login",
    iconHref: "/icons/delivery-icon-192.png",
    themeColor: "#0f766e",
    appleTitle: "Ahmad Delivery",
    title: "Install Delivery App",
    subtitle: "View assigned orders, update delivery status, and use live tracking."
  }
};

export function getPwaAppConfig() {
  return PWA_APPS[getAppMode()] || PWA_APPS.customer;
}
