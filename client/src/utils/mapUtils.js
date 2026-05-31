export const RESTAURANT_LOCATION = {
  lat: Number(import.meta.env.VITE_RESTAURANT_LAT) || 15.2832,
  lng: Number(import.meta.env.VITE_RESTAURANT_LNG) || 73.9862,
  label: "Ahmad Caterers"
};

export function hasLocation(location) {
  return Number.isFinite(Number(location?.lat)) && Number.isFinite(Number(location?.lng));
}

export function normalizeLocation(location) {
  if (!hasLocation(location)) return null;
  return {
    ...location,
    lat: Number(location.lat),
    lng: Number(location.lng),
    accuracy: Number.isFinite(Number(location.accuracy)) ? Number(location.accuracy) : undefined,
    mapsLink: location.mapsLink || googleMapsUrl(location)
  };
}

export function googleMapsUrl(location) {
  if (!hasLocation(location)) return "";
  return `https://www.google.com/maps/search/?api=1&query=${Number(location.lat)},${Number(location.lng)}`;
}

export function googleMapsRouteUrl(location) {
  if (!hasLocation(location)) return "";
  return `https://www.google.com/maps/dir/?api=1&destination=${Number(location.lat)},${Number(location.lng)}`;
}

export function formatAccuracy(location) {
  const accuracy = Number(location?.accuracy);
  return Number.isFinite(accuracy) ? `Approx. ${Math.round(accuracy)} meters` : "Approximate location";
}

export function formatLocationTime(value) {
  if (!value) return "No location yet";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 10) return "Updated just now";
  if (seconds < 60) return `Updated ${seconds} seconds ago`;
  return `Updated ${Math.round(seconds / 60)} minutes ago`;
}
