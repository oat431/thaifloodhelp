import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface DraggableMarkerProps {
  position: [number, number]
  onPositionChange: (lat: number, lng: number) => void
}

const DraggableMarker = ({
  position,
  onPositionChange,
}: DraggableMarkerProps) => {
  const markerRef = useRef<L.Marker>(null)

  useEffect(() => {
    const marker = markerRef.current
    if (marker) {
      marker.on('dragend', () => {
        const newPos = marker.getLatLng()
        onPositionChange(newPos.lat, newPos.lng)
      })
    }
  }, [onPositionChange])

  return <Marker position={position} draggable={true} ref={markerRef} />
}

const MapEvents = ({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void
}) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

interface DraggableMapProps {
  lat: number
  lng: number
  onPositionChange: (lat: number, lng: number) => void
}

export const DraggableMap = ({
  lat,
  lng,
  onPositionChange,
}: DraggableMapProps) => {
  const position: [number, number] = [lat, lng]

  return (
    <div className="rounded-lg overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '300px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker
          position={position}
          onPositionChange={onPositionChange}
        />
        <MapEvents onMapClick={onPositionChange} />
      </MapContainer>
    </div>
  )
}
