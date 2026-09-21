import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Visit } from '../../../api/services';

const createNumberedIcon = (colorClass: string, number: number, isHovered: boolean) => L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm ${colorClass} ${isHovered ? 'scale-125 ring-4 ring-sky-400 z-50 shadow-sky-300' : ''} transition-all duration-300">${number}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const currentLocIcon = L.divIcon({
  className: 'custom-icon',
  html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-md bg-blue-500 animate-pulse"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

interface VisitMapProps {
  currentLoc: { lat: number; lng: number } | null;
  visits: Visit[];
  routeCoords: [number, number][];
  isRouteActive: boolean;
  hoveredVisitId: number | null;
  focusedCoords: [number, number] | null; // <-- YENİ EKLENDİ (Sidebar'dan zoom için)
  onMarkerClick: (visit: Visit) => void;
}

function MapMarker({ visit, hoveredVisitId, mapRef, onMarkerClick }: { visit: Visit; hoveredVisitId: number | null; mapRef: React.RefObject<L.Map | null>; onMarkerClick: (visit: Visit) => void }) {
  const markerRef = useRef<L.Marker | null>(null);
  const isPending = visit.status === 'Pending';
  const isHovered = visit.id === hoveredVisitId;
  const icon = createNumberedIcon(isPending ? 'bg-orange-500' : 'bg-slate-400', visit.routeOrder, isHovered);
  
  const lat = visit.customer.latitude;
  const lng = visit.customer.longitude;

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    if (isHovered) marker.openPopup();
    else marker.closePopup();
  }, [isHovered]);

  return (
    <Marker 
      ref={markerRef}
      position={[lat, lng]} 
      icon={icon}
      eventHandlers={{
        mouseover: () => markerRef.current?.openPopup(),
        mouseout: () => { if (!isHovered) markerRef.current?.closePopup(); },
        click: () => {
          mapRef.current?.flyTo([lat, lng], 16, { animate: true, duration: 1 });
          onMarkerClick(visit);
        }
      }}
    >
      <Popup closeButton={false} autoPan={false}>
        <div className="text-sm p-1">
          <strong className="block text-slate-900 font-bold mb-0.5">{visit.routeOrder}. {visit.customer.dealerName}</strong>
          <span className="text-xs text-slate-500 block">{visit.customer.address}</span>
        </div>
      </Popup>
    </Marker>
  );
}

export default function VisitMap({ currentLoc, visits, routeCoords, isRouteActive, hoveredVisitId, focusedCoords, onMarkerClick }: VisitMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const defaultCenter = visits.length > 0 
    ? [visits[0].customer.latitude, visits[0].customer.longitude] as [number, number]
    : [39.92, 32.85] as [number, number];
  const center = currentLoc ? [currentLoc.lat, currentLoc.lng] as [number, number] : defaultCenter;

  // Sidebar'dan gelen focusedCoords (odaklanma koordinatı) değiştiğinde uçuş animasyonu (flyTo) yap
  useEffect(() => {
    if (focusedCoords && mapRef.current) {
      mapRef.current.flyTo(focusedCoords, 16, { animate: true, duration: 1.2 });
    }
  }, [focusedCoords]);

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 z-0">
      <MapContainer ref={mapRef} center={center} zoom={currentLoc ? 13 : 11} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {currentLoc && (
          <Marker position={[currentLoc.lat, currentLoc.lng]} icon={currentLocIcon}>
            <Popup>Şu anki konumunuz</Popup>
          </Marker>
        )}

        {visits.map((visit) => (
          <MapMarker 
            key={visit.id} 
            visit={visit} 
            hoveredVisitId={hoveredVisitId} 
            mapRef={mapRef} 
            onMarkerClick={onMarkerClick}
          />
        ))}

        {isRouteActive && routeCoords.length > 0 && (
          <Polyline positions={routeCoords} color="#0ea5e9" weight={5} opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
}