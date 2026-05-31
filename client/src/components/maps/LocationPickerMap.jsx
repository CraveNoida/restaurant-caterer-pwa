import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { normalizeLocation } from "../../utils/mapUtils.js";

const pickerIcon = L.divIcon({
  className: "map-pin-icon",
  html: '<span style="background:#f4a51c"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

function DraggableMarker({ location, onChange }) {
  useMapEvents({
    click(event) {
      onChange?.({ ...location, lat: event.latlng.lat, lng: event.latlng.lng });
    }
  });

  return (
    <Marker
      draggable
      eventHandlers={{
        dragend(event) {
          const next = event.target.getLatLng();
          onChange?.({ ...location, lat: next.lat, lng: next.lng });
        }
      }}
      icon={pickerIcon}
      position={[location.lat, location.lng]}
    />
  );
}

export default function LocationPickerMap({ location, onChange, height = 230 }) {
  const normalized = normalizeLocation(location);
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  if (isOffline) return <div className="map-state">Map needs internet. You can still enter your address manually.</div>;
  if (!normalized) return null;

  return (
    <div className="map-picker">
      <MapContainer center={[normalized.lat, normalized.lng]} zoom={17} scrollWheelZoom={false} style={{ height }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker location={normalized} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
