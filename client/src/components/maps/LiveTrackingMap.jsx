import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { hasLocation, normalizeLocation, RESTAURANT_LOCATION } from "../../utils/mapUtils.js";

const markerColors = {
  customer: "#f4a51c",
  delivery: "#0f766e",
  restaurant: "#15110d",
  selected: "#2563eb"
};

function createMarkerIcon(type) {
  const color = markerColors[type] || markerColors.selected;
  return L.divIcon({
    className: "map-pin-icon",
    html: `<span style="background:${color}"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
}

function FitBounds({ markers }) {
  const map = useMap();

  useEffect(() => {
    const points = markers.filter((marker) => hasLocation(marker.location)).map((marker) => [marker.location.lat, marker.location.lng]);
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 16);
      return;
    }
    map.fitBounds(points, { padding: [28, 28], maxZoom: 16 });
  }, [map, markers]);

  return null;
}

export default function LiveTrackingMap({
  title = "Location map",
  subtitle,
  customerLocation,
  deliveryLocation,
  showRestaurant = true,
  height = 240,
  className = "",
  emptyText = "Location is not available yet."
}) {
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
  const markers = useMemo(() => {
    const next = [];
    const customer = normalizeLocation(customerLocation);
    const delivery = normalizeLocation(deliveryLocation);
    const restaurant = normalizeLocation(RESTAURANT_LOCATION);

    if (customer) next.push({ type: "customer", label: "Customer location", location: customer });
    if (delivery) next.push({ type: "delivery", label: "Delivery partner", location: delivery });
    if (showRestaurant && restaurant) next.push({ type: "restaurant", label: RESTAURANT_LOCATION.label, location: restaurant });
    return next;
  }, [customerLocation, deliveryLocation, showRestaurant]);

  const center = markers[0]?.location || normalizeLocation(RESTAURANT_LOCATION);
  return (
    <section className={`map-card ${className}`}>
      <div className="map-card-head">
        <div>
          <span>{title}</span>
          {subtitle && <strong>{subtitle}</strong>}
        </div>
      </div>
      {isOffline ? (
        <div className="map-state">Map needs internet. Saved order details remain available.</div>
      ) : markers.length ? (
        <MapContainer center={[center.lat, center.lng]} zoom={15} scrollWheelZoom={false} style={{ height }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds markers={markers} />
          {markers.map((marker) => (
            <Marker
              icon={createMarkerIcon(marker.type)}
              key={`${marker.type}-${marker.location.lat}-${marker.location.lng}`}
              position={[marker.location.lat, marker.location.lng]}
            >
              <Popup>{marker.label}</Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="map-state">{emptyText}</div>
      )}
    </section>
  );
}
