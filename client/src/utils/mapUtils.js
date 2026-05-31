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

function formatNominatimAddress(address = {}) {
  return [
    address.house_number && address.road ? `${address.house_number} ${address.road}` : address.road,
    address.neighbourhood || address.suburb || address.city_district,
    address.city || address.town || address.village,
    address.state,
    address.postcode,
    address.country
  ].filter(Boolean).join(", ");
}

export function formatDetectedAddress(rawAddress, address = {}) {
  const area = address.neighbourhood || address.suburb || address.city_district || address.road || address.quarter;
  const city = address.city || address.town || address.village || address.municipality || address.county;
  const clean = [area, city, address.state, address.postcode, address.country]
    .filter(Boolean)
    .filter((part, index, list) => list.findIndex((item) => item.toLowerCase() === part.toLowerCase()) === index)
    .join(", ");

  if (clean) return clean;
  return String(rawAddress || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(-5)
    .join(", ");
}

export async function reverseGeocode(lat, lng) {
  if (!hasLocation({ lat, lng })) throw new Error("Invalid location");

  const googleKey = import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY;
  if (googleKey) {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("latlng", `${Number(lat)},${Number(lng)}`);
    url.searchParams.set("key", googleKey);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Google reverse geocoding failed");

    const data = await response.json();
    const address = data.results?.[0]?.formatted_address;
    if (data.status !== "OK" || !address) throw new Error("Google reverse geocoding returned no address");
    return { address, rawAddress: address };
  }

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", Number(lat));
  url.searchParams.set("lon", Number(lng));
  url.searchParams.set("zoom", "18");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) throw new Error("OpenStreetMap reverse geocoding failed");

  const data = await response.json();
  const rawAddress = data.display_name || formatNominatimAddress(data.address);
  const address = formatDetectedAddress(rawAddress, data.address);
  if (!address) throw new Error("OpenStreetMap reverse geocoding returned no address");
  return { address, rawAddress };
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
