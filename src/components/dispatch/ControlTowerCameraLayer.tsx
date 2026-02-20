/**
 * ControlTowerCameraLayer — renders camera event markers on the control tower map.
 * Called from ControlTower when the camera layer is enabled.
 */
import { useEffect, useRef } from 'react';
import { getRecentCameraEvents, SEVERITY_CONFIG, EVENT_TYPE_LABELS, type CameraEvent } from '@/lib/cameraService';

const SEVERITY_MARKER_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#3b82f6',
  INFO: '#6b7280',
};

interface ControlTowerCameraLayerProps {
  map: any; // google.maps.Map
  visible: boolean;
  onEventClick?: (event: CameraEvent) => void;
}

export function useControlTowerCameraLayer({ map, visible, onEventClick }: ControlTowerCameraLayerProps) {
  const markersRef = useRef<any[]>([]);
  const eventsRef = useRef<CameraEvent[]>([]);

  useEffect(() => {
    if (!map || !visible) {
      // Clear markers
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
      return;
    }

    (async () => {
      try {
        const events = await getRecentCameraEvents(100);
        eventsRef.current = events;

        // Clear old markers
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        events.forEach(event => {
          if (!event.gps_lat || !event.gps_lng) return;

          const color = SEVERITY_MARKER_COLORS[event.severity] || '#6b7280';
          const sev = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.INFO;

          const marker = new window.google.maps.Marker({
            position: { lat: event.gps_lat, lng: event.gps_lng },
            map,
            title: `${EVENT_TYPE_LABELS[event.event_type] || event.event_type} (${sev.label})`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: event.severity === 'CRITICAL' ? 9 : event.severity === 'HIGH' ? 7 : 5,
              fillColor: color,
              fillOpacity: 0.9,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
            zIndex: event.severity === 'CRITICAL' ? 100 : 50,
          });

          const info = new window.google.maps.InfoWindow({
            content: `
              <div style="font-family:system-ui;padding:4px;max-width:250px">
                <strong>${sev.icon} ${EVENT_TYPE_LABELS[event.event_type] || event.event_type}</strong>
                <br/><span style="color:#666">Severity: ${sev.label}</span>
                ${event.speed_mph ? `<br/><span style="color:#666">Speed: ${event.speed_mph} mph</span>` : ''}
                ${event.trucks?.truck_number ? `<br/><span style="color:#666">Truck: ${event.trucks.truck_number}</span>` : ''}
                <br/><small style="color:#999">${new Date(event.event_timestamp).toLocaleString()}</small>
              </div>
            `,
          });

          marker.addListener('click', () => {
            info.open(map, marker);
            onEventClick?.(event);
          });

          markersRef.current.push(marker);
        });
      } catch (err) {
        console.error('Failed to load camera events for map:', err);
      }
    })();

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, [map, visible]);

  return { events: eventsRef.current };
}
