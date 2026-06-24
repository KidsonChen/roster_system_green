import { LOCATIONS } from '../data/shiftData'

function LocationTabs({ currentLocation, onLocationChange }) {
  return (
    <div className="location-tabs">
      {LOCATIONS.map(loc => (
        <button
          key={loc.id}
          className={`location-tab ${currentLocation === loc.id ? 'active' : ''}`}
          onClick={() => onLocationChange(loc.id)}
        >
          {loc.name}
        </button>
      ))}
    </div>
  )
}

export default LocationTabs