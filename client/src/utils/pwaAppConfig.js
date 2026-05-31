const PWA_APPS = {
  customer: {
    manifestHref: "/manifest.json",
    iconHref: "/icons/icon-192.png",
    themeColor: "#15110d",
    appleTitle: "Ahmad Caterers",
    title: "Install Ahmad Caterers App",
    subtitle: "Order food and book catering faster from your home screen."
  },
  admin: {
    manifestHref: "/admin-manifest.json",
    iconHref: "/icons/admin-icon-192.png",
    themeColor: "#111827",
    appleTitle: "Ahmad Admin",
    title: "Install Admin App",
    subtitle: "Manage orders, menu, bookings, payments, and delivery from your dashboard."
  },
  delivery: {
    manifestHref: "/delivery-manifest.json",
    iconHref: "/icons/delivery-icon-192.png",
    themeColor: "#0f766e",
    appleTitle: "Ahmad Delivery",
    title: "Install Delivery App",
    subtitle: "View assigned orders, update delivery status, and use live tracking."
  }
};

export function getPwaAppConfig(pathname = "/") {
  if (pathname.startsWith("/admin")) return PWA_APPS.admin;
  if (pathname.startsWith("/delivery")) return PWA_APPS.delivery;
  return PWA_APPS.customer;
}
