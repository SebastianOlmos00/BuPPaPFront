import { useEffect, useState } from 'react';

const vehicles = [
  { id: 1, name: 'Bus de prueba 01', position: [-23.6425, -70.3985] as [number, number] },
  { id: 2, name: 'Bus de prueba 02', position: [-23.6535, -70.4050] as [number, number] },
  { id: 3, name: 'Bus de prueba 03', position: [-23.6590, -70.3900] as [number, number] },
];

const stops = [
  { id: 1, name: 'Paradero de ejemplo 01', position: [-23.6470, -70.4020] as [number, number] },
  { id: 2, name: 'Paradero de ejemplo 02', position: [-23.6550, -70.3970] as [number, number] },
  { id: 3, name: 'Paradero de ejemplo 03', position: [-23.6380, -70.3920] as [number, number] },
];

export default function MapView() {
  const [mapModules, setMapModules] = useState<any>(null);

  useEffect(() => {
    let active = true;

    async function loadMap() {
      try {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

        if (!document.getElementById('leaflet-css')) {
          link.id = 'leaflet-css';
          document.head.appendChild(link);
        }

        const [reactLeaflet, leaflet] = await Promise.all([
          import('react-leaflet'),
          import('leaflet'),
        ]);

        const vehicleIcon = leaflet.default.divIcon({
          className: '',
          html: '<div style="width:30px;height:30px;border-radius:50%;background:#3F464D;border:3px solid white;box-shadow:0 2px 6px #0005;display:flex;align-items:center;justify-content:center;color:white;font-size:15px;">🚌</div>',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const stopIcon = leaflet.default.divIcon({
          className: '',
          html: '<div style="width:16px;height:16px;border-radius:50%;background:#B7CBD3;border:3px solid #3F464D;box-shadow:0 2px 5px #0005;"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        if (active) {
          setMapModules({
            ...reactLeaflet,
            vehicleIcon,
            stopIcon,
          });
        }
      } catch (error) {
        console.error('Error al cargar Leaflet:', error);
      }
    }

    loadMap();

    return () => {
      active = false;
    };
  }, []);

  if (!mapModules) {
    return null;
  }

  const {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    vehicleIcon,
    stopIcon,
  } = mapModules;

  return (
    <MapContainer
      center={[-23.6500, -70.3970]}
      zoom={14}
      scrollWheelZoom
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {vehicles.map((vehicle: typeof vehicles[number]) => (
        <Marker
          key={`vehicle-${vehicle.id}`}
          position={vehicle.position}
          icon={vehicleIcon}
        >
          <Popup>{vehicle.name} · Ubicación de demostración</Popup>
        </Marker>
      ))}

      {stops.map((stop: typeof stops[number]) => (
        <Marker
          key={`stop-${stop.id}`}
          position={stop.position}
          icon={stopIcon}
        >
          <Popup>{stop.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
